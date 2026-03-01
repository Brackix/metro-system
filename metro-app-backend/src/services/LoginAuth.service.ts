import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LoginAuthService {
  async authenticateLogin(identifier: string, password: string): Promise<any | null> {
    try {
      console.log('🔍 Buscando usuario con identifier:', identifier);

      const user = await prisma.users.findFirst({
        where: {
          OR: [
            { username: identifier },
            { email: identifier }
          ],
          status: 'active'
        },
        select: {
          userid: true,
          firstname: true,
          lastname: true,
          phone: true,
          email: true,
          passwordhash: true,
          status: true
        }
      });

      if (!user) {
        console.log('❌ Usuario no existe o no está activo');
        return null;
      }

      if (password !== user.passwordhash) {
        console.log('❌ Contraseña incorrecta');
        return null;
      }

      console.log('✅ Autenticación exitosa');
       // 🕒 Actualizar el campo lastaccess al tiempo actual
      await prisma.users.update({
        where: { userid: user.userid },
        data: { lastaccess: new Date() }
      });
      // Devolver datos sin la contraseña
      const { passwordhash, ...userData } = user;
      return userData;

    } catch (error) {
      console.error('💥 Error en authService:', error);
      throw error;
    }
  }
}
