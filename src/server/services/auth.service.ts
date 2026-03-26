import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput } from '../validations/auth.schema';
import jwt, { SignOptions } from 'jsonwebtoken';

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
