import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Settings, BarChart3, Shield, Search, Filter, UserPlus } from 'lucide-react';
import { apiRequest, projectAPI, taskAPI } from '@/utils/api';
import { toast } from '@/hooks/use-toast';

// Import the Dialog components for the modal
import { Dialog, DialogTrigger } from '@/components/ui/dialog'; // Assuming you use shadcn/ui Dialog

import AdminStats from '@/components/AdminStats';
// Import the AddUserForm component
import AddUserForm from '@/components/AddUserForm'; 

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(null);
  const [activationLoading, setActivationLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // State for the Add User modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Function to fetch user data
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching users...');
        const usersData = await apiRequest('/api/v1/admin/users');
        console.log('Users data received:', usersData);
        setUsers(usersData);
        setFilteredUsers(usersData);
        
      // Fetch projects separately and handle their errors independently
      try {
        const projectsData = await projectAPI.search();
        console.log('Projects data received:', projectsData);
        setProjects(projectsData);
      } catch (projectError) {
        console.error('Failed to fetch projects:', projectError);
        // You might want to set a separate error state for projects or just log this
        // For now, we just log and don't let it block user display
      }

        // Fetch task data
        try {
          const tasksData = await taskAPI.fetchTasks();
          console.log('Tasks data received:', tasksData);
          setTasks(tasksData); // Set the tasks state
        } catch (taskError) {
          console.error('Failed to fetch tasks:', taskError);
          // Handle task fetching error if needed
        }

      } catch (err: any) {
      console.error('Failed to fetch user data:', err);
      // Only set the main error state if fetching users failed
        if (err.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else if (err.status === 404) {
          setError('Admin endpoints not found. Please check API configuration.');
      } else {
        setError(err.message || 'Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchData(); // Initial data fetch
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, refetching data...');
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]); // Depend on fetchData to ensure the correct function is called

  useEffect(() => {
    // Filter users based on search term and role filter
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user =>
        user.roles && user.roles.some((role: any) => 
          (typeof role === 'string' ? role : role.role)?.toLowerCase().includes(roleFilter.toLowerCase().replace('role_', ''))
        )
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleChangeLoading(userId);
    try {
      await apiRequest(`/api/v1/admin/users/${userId}/role?role=${newRole}`, { method: 'PUT' });
      setUsers((prev) => prev.map((u) => 
        u.userId === userId ? { ...u, roles: [{ role: newRole }] } : u
      ));
      toast({
        title: "Success!",
        description: "User role updated successfully."
      });
    } catch (error: any) {
      console.error('Failed to change role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
    setRoleChangeLoading(null);
  };

  const handleActivationToggle = async (userId: string, active: boolean) => {
    setActivationLoading(userId);
    try {
      await apiRequest(`/api/v1/admin/users/${userId}/activate?active=${active ? 1 : 0}`, { method: 'PUT' });
      setUsers((prev) => prev.map((u) => 
        u.userId === userId ? { ...u, active } : u
      ));
      toast({
        title: "Success!",
        description: `User ${active ? 'activated' : 'deactivated'} successfully.`
      });
    } catch (error: any) {
      console.error('Failed to toggle activation:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
    setActivationLoading(null);
  };

  const getUserRoleDisplay = (user: any) => {
    if (!user.roles || user.roles.length === 0) return 'No Role';
    return user.roles.map((r: any) => 
      typeof r === 'string' ? r : r.role
    ).join(', ');
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inactive</span>
    );
  };

  // Function to refresh user list after adding a user
  const handleUserAdded = () => {
    setShowAddUserModal(false);
    fetchData(); // Refresh the list
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary">Admin Dashboard</h2>
          <p className="text-secondary/70 mt-1">Manage projects, users, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-accent/20 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary/70">Total Users</p>
                  <p className="text-2xl font-bold text-primary">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary/70">Active Projects</p>
                  <p className="text-2xl font-bold text-primary">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary/70">Active Users</p>
                  <p className="text-2xl font-bold text-primary">
                    {users.filter(u => u.active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary/70">Admins</p>
                  <p className="text-2xl font-bold text-primary">
                    {users.filter(u => u.roles?.some((r: any) => 
                      (typeof r === 'string' ? r : r.role)?.includes('ADMIN')
                    )).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="border-accent/20 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Management
              </CardTitle>
              
              {/* Add User Button triggering the modal */}
              <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
                <DialogTrigger asChild>
              <Button
                className="bg-primary hover:bg-secondary text-white"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
                </DialogTrigger>
                {/* Render the AddUserForm inside the Dialog */}
                <AddUserForm onClose={() => setShowAddUserModal(false)} onUserAdded={handleUserAdded} />
              </Dialog>

            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-secondary/60" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-accent/30 focus:border-primary"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-secondary/60" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-accent/30 rounded-md px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="project_leader">Project Leader</option>
                  <option value="team_member">Team Member</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-secondary/70">Loading users...</span>
              </div>
            ) : error && filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-medium">Error Loading Users</p>
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              !loading && (!error || filteredUsers.length > 0) && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-accent/20">
                      <th className="text-left py-3 px-2 font-medium text-secondary">User ID</th>
                      <th className="text-left py-3 px-2 font-medium text-secondary">Username</th>
                      <th className="text-left py-3 px-2 font-medium text-secondary">Email</th>
                      <th className="text-left py-3 px-2 font-medium text-secondary">Role</th>
                      <th className="text-left py-3 px-2 font-medium text-secondary">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.userId} className="border-b border-accent/10 hover:bg-accent/5 transition-colors">
                        <td className="py-3 px-2 text-secondary/80">{user.userId}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                              <span className="text-primary text-xs font-medium">
                                {user.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-primary">{user.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-secondary/80">{user.email}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {getUserRoleDisplay(user)}
                          </span>
                        </td>
                        <td className="py-3 px-2">{getStatusBadge(user.active)}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-2">
                            <select
                              aria-label="Change user role"
                              value={user.roles && user.roles.length > 0 ? 
                                (typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0].role) : ''}
                              onChange={e => handleRoleChange(user.userId, e.target.value)}
                              disabled={roleChangeLoading === user.userId}
                                className="border border-accent/30 rounded-md px-2 py-1 text-xs focus:border-primary focus:outline-none"
                            >
                              <option value="ROLE_ADMIN">Admin</option>
                              <option value="ROLE_PROJECT_LEADER">Project Leader</option>
                              <option value="ROLE_TEAM_MEMBER">Team Member</option>
                            </select>
                            <Button
                              onClick={() => handleActivationToggle(user.userId, !user.active)}
                              disabled={activationLoading === user.userId}
                                variant={user.active ? "destructive" : "secondary"}
                              size="sm"
                            >
                                {activationLoading === user.userId ? 
                                  (user.active ? 'Deactivating...' : 'Activating...') : 
                                  (user.active ? 'Deactivate' : 'Activate')
                                }
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <AdminStats users={users} projects={projects} tasks={tasks} />
      </div>
    </div>
  );
};

export default AdminDashboard;
