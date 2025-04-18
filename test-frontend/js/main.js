// DOM Elements
const otpSection = document.getElementById('otpSection');
const profileSection = document.getElementById('profileSection');
const responseDiv = document.getElementById('response');

// Helper Functions
function showResponse(data, isError = false) {
    responseDiv.textContent = JSON.stringify(data, null, 2);
    responseDiv.className = `response ${isError ? 'error' : 'success'}`;
}

function showProfileSection() {
    profileSection.style.display = 'block';
    // Try to get existing profile
    getProfile();
}

// Event Handlers
async function requestOtp() {
    const phone = document.getElementById('phone').value;
    if (!phone) {
        showResponse({ error: 'Phone number is required' }, true);
        return;
    }
    try {
        const response = await api.requestOtp(phone);
        showResponse({ message: 'OTP sent successfully' });
        otpSection.style.display = 'block';
    } catch (error) {
        showResponse({ error: error.message || 'Failed to send OTP' }, true);
    }
}

async function verifyOtp() {
    const phone = document.getElementById('phone').value;
    const otp = document.getElementById('otp').value;
    
    if (!phone || !otp) {
        showResponse({ error: 'Phone number and OTP are required' }, true);
        return;
    }
    
    try {
        const data = await api.verifyOtp(phone, otp);
        api.setToken(data.token);
        showResponse({ message: 'OTP verified successfully' });
        showProfileSection();
    } catch (error) {
        showResponse({ error: error.message || 'Failed to verify OTP' }, true);
    }
}

async function updateProfile() {
    const username = document.getElementById('username').value;
    const location = document.getElementById('location').value;
    
    if (!username || !location) {
        showResponse({ error: 'Username and location are required' }, true);
        return;
    }
    
    const bio = document.getElementById('bio').value;
    const moq = document.getElementById('moq').value;
    const interestsInput = document.getElementById('interests').value;
    
    // Convert interests string to array, handling empty string case
    const interests = interestsInput 
        ? interestsInput.split(',').map(i => i.trim()).filter(i => i)
        : [];

    try {
        const data = await api.updateProfile({
            username,
            bio,
            location,
            moq: parseInt(moq),
            interests, // Now properly formatted as an array
        });
        showResponse(data);
    } catch (error) {
        showResponse({ error: error.message || 'Failed to update profile' }, true);
    }
}

async function getProfile() {
    try {
        const data = await api.getProfile();
        showResponse(data);
        
        // Populate form with profile data
        document.getElementById('username').value = data.username || '';
        document.getElementById('bio').value = data.bio || '';
        document.getElementById('location').value = data.location || '';
        document.getElementById('moq').value = data.moq || 1;
        document.getElementById('interests').value = data.interests?.join(', ') || '';
    } catch (error) {
        if (error.message.includes('401')) {
            // Token expired or invalid
            api.clearToken();
            profileSection.style.display = 'none';
            otpSection.style.display = 'none';
        }
        showResponse({ error: error.message || 'Failed to get profile' }, true);
    }
}

async function deleteProfile() {
    if (!confirm('Are you sure you want to delete your profile?')) return;
    
    try {
        await api.deleteProfile();
        showResponse({ message: 'Profile deleted successfully' });
        profileSection.style.display = 'none';
        api.clearToken();
    } catch (error) {
        showResponse({ error: error.message || 'Failed to delete profile' }, true);
    }
}

// Initialize
if (api.token) {
    showProfileSection();
} 