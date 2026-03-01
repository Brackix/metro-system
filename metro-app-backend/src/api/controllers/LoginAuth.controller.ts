// LoginAuth.controller.ts
import { Request, Response } from 'express';
import { LoginAuthService } from '../../services/LoginAuth.service';

const authService = new LoginAuthService();

interface LoginRequest {
  identifier: string;
  password: string;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password }: LoginRequest = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Usuario/Email y contraseña son requeridos'
      });
      return;
    }
    
    const user = await authService.authenticateLogin(identifier, password);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Autenticación exitosa',
      user // aquí va el objeto con userid, firstname, lastname, phone, email, etc.
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
