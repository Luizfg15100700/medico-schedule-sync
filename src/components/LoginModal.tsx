
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 justify-center">
            <div className="medical-gradient p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl">
              Acesso ao Sistema
            </DialogTitle>
          </div>
        </DialogHeader>

        <Card>
          <CardContent className="p-6 text-center">
            <LogIn className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Faça login para continuar</h3>
            <p className="text-gray-600 mb-6">
              Você precisa estar autenticado para acessar o sistema de grades horárias.
            </p>
            
            <Button 
              onClick={handleLoginRedirect}
              className="w-full medical-gradient"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
