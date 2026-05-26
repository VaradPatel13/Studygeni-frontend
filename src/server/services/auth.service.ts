import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput } from '../validations/auth.schema';
import jwt, { SignOptions } from 'jsonwebtoken';
import Subscription from '@/models/Subscription';

const DEFAULT_FREE_PLAN = 'free';
const DEFAULT_FREE_LIMIT = 3;
const DEFAULT_FREE_AMOUNT = 0;

const userRepository = new UserRepository();

export class AuthService {
  private generateToken(id: string) {
    const secret = process.env.JWT_SECRET!;
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRE || '30d') as any
    };
    return jwt.sign({ id }, secret, options);
  }

  async registerUser(input: RegisterInput) {
    const userExists = await userRepository.exists({
      $or: [{ email: input.email }, { username: input.username }, { mobileNumber: input.mobileNumber }],
    });

    if (userExists) {
      throw new Error('User already exists');
    }

    const user = await userRepository.create(input);
    await userRepository.update(user._id.toString(), { subscriptionPlan: DEFAULT_FREE_PLAN });

    await Subscription.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        plan: DEFAULT_FREE_PLAN,
        status: 'active',
        documentsLimit: DEFAULT_FREE_LIMIT,
        documentsUsed: 0,
        amount: DEFAULT_FREE_AMOUNT,
        currency: 'INR',
      },
      { upsert: true, new: true }
    );

    const token = this.generateToken(user._id.toString());

    return { token, user };
  }

  async loginUser(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user || !(await (user as any).matchPassword(input.password))) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber,
        profileImage: user.profileImage,
        subscriptionPlan: (user as any).subscriptionPlan || DEFAULT_FREE_PLAN,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(userId: string, data: any) {
    const user = await userRepository.update(userId, data);
    return user;
  }

  async changePassword(userId: string, { currentPassword, newPassword }: any) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await (user as any).matchPassword(currentPassword);
    if (!isMatch) throw new Error('Current password is incorrect');

    user.password = newPassword;
    await user.save();
    return true;
  }
}
