
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminActionProps {
  isAdmin?: boolean; // Make optional
  onAdminAction: () => void;
}

const AdminAction: React.FC<AdminActionProps> = ({ isAdmin: propIsAdmin, onAdminAction }) => {
  // Get admin status directly from context
  const { isAdmin: contextIsAdmin } = useAuth();
  
  // Use context isAdmin value if prop isn't provided
  const effectiveIsAdmin = propIsAdmin !== undefined ? propIsAdmin : contextIsAdmin;
  
  useEffect(() => {
    console.log("AdminAction component - effectiveIsAdmin:", effectiveIsAdmin, 
      "propIsAdmin:", propIsAdmin, "contextIsAdmin:", contextIsAdmin);
  }, [effectiveIsAdmin, propIsAdmin, contextIsAdmin]);
  
  // Only render the button if the user is an admin
  if (!effectiveIsAdmin) {
    console.log("AdminAction not rendering - user is not admin");
    return null;
  }

  return (
    <div className="mb-4 flex justify-end">
      <Button 
        variant="outline" 
        className="bg-cyber-purple/20 text-cyber-purple border-cyber-purple flex items-center gap-2"
        onClick={onAdminAction}
      >
        <Settings className="h-4 w-4" />
        Admin Panel
      </Button>
    </div>
  );
};

export default AdminAction;
