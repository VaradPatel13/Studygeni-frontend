import { NextRequest } from 'next/server';
import cloudinary from '@/lib/server/cloudinary';
import Document from '@/models/Document';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { dispatchDocumentProcessing } from '@/server/services/document-processor.service';
import { sendSuccess, sendError } from '@/lib/server/response';
import connectDB from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return sendError('Not authorized', 'AUTH_ERROR', 401);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) return sendError('No file uploaded', 'VALIDATION_ERROR', 400);

    await connectDB();

    const [user, subscription] = await Promise.all([
      User.findById(userId).select('subscriptionPlan'),
      Subscription.findOne({ userId }).sort({ updatedAt: -1 }),
    ]);

    const activePlan = user?.subscriptionPlan || 'free';
    const activePlanDetails = activePlan === 'free'
      ? { plan: 'free', planName: 'Free', documentsLimit: 3 }
      : subscription && subscription.status === 'active'
        ? {
            plan: subscription.plan,
            planName: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
            documentsLimit: subscription.documentsLimit,
          }
        : {
            plan: activePlan,
            planName: activePlan.charAt(0).toUpperCase() + activePlan.slice(1),
            documentsLimit: 3,
          };

    let documentsUsed = 0;
    if (activePlanDetails.plan !== 'free' && subscription && subscription.status === 'active' && subscription.startDate) {
      documentsUsed = await Document.countDocuments({
        userId,
        uploadDate: { $gte: subscription.startDate },
      });
    } else {
      documentsUsed = await Document.countDocuments({ userId });
    }

    if (documentsUsed >= activePlanDetails.documentsLimit) {
      return sendError(
        `Upload limit reached. You have uploaded ${documentsUsed} of your allowed ${activePlanDetails.documentsLimit} documents. Please upgrade your plan.`,
        'LIMIT_EXCEEDED_ERROR',
        403
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type
    const getResourceType = (mimetype: string): 'auto' | 'raw' | 'video' | 'image' => {
      if (mimetype.startsWith('video/')) return 'video';
      if (mimetype.startsWith('image/') || mimetype === 'application/pdf') return 'auto';
      return 'raw';
    };

    const resourceType = getResourceType(file.type);

    // Upload to Cloudinary using stream
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'studymate',
          resource_type: resourceType,
          access_mode: 'public',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const document = await Document.create({
      userId,
      title: title || file.name,
      filename: file.name,
      filepath: uploadResult.secure_url,
      filesize: file.size,
      fileType: file.type,
      uploadDate: new Date(),
    });

    // Start background processing
    const processableTypes = [
      'application/pdf',
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (processableTypes.includes(file.type)) {
      dispatchDocumentProcessing(document._id.toString());
    }

    return sendSuccess('Document uploaded successfully', {
      id: document._id,
      title: document.title,
      url: document.filepath,
      status: document.status,
    }, 201);

  } catch (error: any) {
    return sendError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
  }
}
