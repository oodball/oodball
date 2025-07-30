import { supabase } from '../supabase_client';

// Listen for user deletion events
export function setupUserDeletionListener() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'USER_DELETED') {
        console.log('User deleted, cleaning up...');
        
        // You could make API calls here to clean up external services
        // or send notifications, etc.
        
        // Example: Clean up user data in external services
        // await cleanupExternalUserData(session.user.id);
        
        // Example: Send notification to admin
        // await notifyAdminOfUserDeletion(session.user.email);
      }
    }
  );

  return subscription;
}

// Function to manually clean up user data (if needed)
export async function cleanupUserData(userId) {
  try {
    // Clean up any application-specific data
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error cleaning up user comments:', error);
    }

    // Add any other cleanup tasks here
    // await cleanupUserFiles(userId);
    // await cleanupUserPreferences(userId);

  } catch (error) {
    console.error('Error during user cleanup:', error);
  }
}

// Function to handle user deletion from admin panel
export async function deleteUser(userId) {
  try {
    // First, clean up any application data
    await cleanupUserData(userId);
    
    // Then delete the user from auth.users
    // Note: This requires admin privileges
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    
    console.log('User deleted successfully');
    
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
} 