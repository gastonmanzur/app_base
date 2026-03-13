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
        }
      }
    }
  },
  interpolation: {
    escapeValue: false
  }
});
