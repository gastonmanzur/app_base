import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
  lng: 'es',
  fallbackLng: 'en',
  resources: {
    es: {
      translation: {
        home: {
          title: 'Starter profesional listo para escalar',
          subtitle: 'Base modular React + Express + MongoDB con TypeScript estricto.',
          switchLanguage: 'Cambiar idioma'
        },
        auth: {
          common: { goLogin: 'Ir a login' },
          register: { title: 'Registro', submit: 'Crear cuenta', success: 'Registro exitoso, revisa tu email.' },
          login: {
            title: 'Login',
            submit: 'Ingresar',
            google: 'Entrar con Google',
            forgot: '¿Olvidaste tu contraseña?'
          },
          verify: { title: 'Verificar email', submit: 'Verificar', success: 'Email verificado correctamente' },
          forgot: { title: 'Recuperar contraseña', submit: 'Enviar email', success: 'Si existe la cuenta, enviamos un email.' },
          reset: { title: 'Resetear contraseña', submit: 'Guardar nueva contraseña', success: 'Contraseña actualizada' },
          change: {
            title: 'Cambiar contraseña',
            current: 'Contraseña actual',
            new: 'Nueva contraseña',
            submit: 'Actualizar',
            success: 'Contraseña cambiada'
          }
        },
        profile: {
          title: 'Perfil',
          greeting: 'Hola {{email}}',
          role: 'Rol: {{role}}',
          changePassword: 'Cambiar contraseña',
          avatar: {
            title: 'Avatar',
            alt: 'Avatar de usuario',
            empty: 'Todavía no tienes avatar.',
            delete: 'Eliminar avatar',
            uploadSuccess: 'Avatar actualizado correctamente',
            deleteSuccess: 'Avatar eliminado',
            invalidType: 'Selecciona una imagen válida (png, jpg o webp).',
            invalidSize: 'El archivo excede el tamaño máximo permitido (2 MB).',
            unexpectedError: 'No se pudo procesar el avatar.'
          }
        }
      }
    },
    en: {
      translation: {
        home: {
          title: 'Professional starter ready to scale',
          subtitle: 'Modular React + Express + MongoDB baseline with strict TypeScript.',
          switchLanguage: 'Switch language'
        },
        auth: {
          common: { goLogin: 'Go to login' },
          register: { title: 'Register', submit: 'Create account', success: 'Registration successful, check your email.' },
          login: {
            title: 'Login',
            submit: 'Sign in',
            google: 'Sign in with Google',
            forgot: 'Forgot your password?'
          },
          verify: { title: 'Verify email', submit: 'Verify', success: 'Email verified successfully' },
          forgot: { title: 'Forgot password', submit: 'Send email', success: 'If account exists, email has been sent.' },
          reset: { title: 'Reset password', submit: 'Save new password', success: 'Password updated' },
          change: {
            title: 'Change password',
            current: 'Current password',
            new: 'New password',
            submit: 'Update',
            success: 'Password changed'
          }
        },
        profile: {
          title: 'Profile',
          greeting: 'Hello {{email}}',
          role: 'Role: {{role}}',
          changePassword: 'Change password',
          avatar: {
            title: 'Avatar',
            alt: 'User avatar',
            empty: 'No avatar uploaded yet.',
            delete: 'Delete avatar',
            uploadSuccess: 'Avatar updated successfully',
            deleteSuccess: 'Avatar deleted',
            invalidType: 'Select a valid image (png, jpg or webp).',
            invalidSize: 'The file exceeds the max allowed size (2 MB).',
            unexpectedError: 'Avatar could not be processed.'
          }
        }
      }
    }
  },
  interpolation: {
    escapeValue: false
  }
});
