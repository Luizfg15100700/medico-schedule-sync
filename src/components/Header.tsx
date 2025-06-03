
import React, { useState } from 'react';
import { GraduationCap, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationModal } from './NotificationModal';
import { useAuth } from '@/hooks/useAuth';
import { useInstitution } from '@/hooks/useInstitution';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, signOut } = useAuth();
  const { currentInstitution, userRole } = useInstitution();

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="medical-gradient p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">MedSchedule</h1>
            <p className="text-sm text-gray-600">
              {currentInstitution?.name || 'Sistema de Grades Horárias'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                  <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <NotificationModal 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};
