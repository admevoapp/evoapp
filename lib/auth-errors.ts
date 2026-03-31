export const translateAuthError = (message: string): string => {
    switch (message) {
        // Login & Signup Errors
        case 'Invalid login credentials':
            return 'E-mail ou senha incorretos.';
        case 'User already registered':
            return 'Este e-mail já está cadastrado em nossa plataforma.';
        case 'Password should be at least 6 characters':
            return 'A senha deve ter pelo menos 6 caracteres.';
        case 'To signup, please provide your email':
            return 'Por favor, informe seu e-mail para realizar o cadastro.';
        case 'Email not confirmed':
            return 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada.';
        
        // Update Password Errors
        case 'New password should be different from the old password':
            return 'A nova senha deve ser diferente da senha atual.';
        
        // Rate Limiting
        case 'Too many requests':
            return 'Muitas tentativas em pouco tempo. Por favor, aguarde um momento antes de tentar novamente.';
        case 'email rate limit exceeded':
            return 'Limite de envio de e-mail excedido. Por favor, aguarde alguns minutos antes de tentar recuperar sua senha novamente.';
        case 'Rate limit exceeded':
            return 'Muitas solicitações em pouco tempo. Por favor, aguarde um momento.';
        
        // Forgot Password
        case 'User not found':
            return 'Não encontramos nenhum usuário com este e-mail.';
            
        // Default message
        default:
            // Check for specific substrings if exact match fails
            if (message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
            if (message.includes('already registered')) return 'Este e-mail já está cadastrado.';
            if (message.includes('at least 6 characters')) return 'A senha deve ter pelo menos 6 caracteres.';
            if (message.includes('rate limit exceeded')) return 'Muitas solicitações seguidas. Por favor, aguarde alguns minutos.';
            
            return message || 'Ocorreu um erro inesperado durante a autenticação.';
    }
};
