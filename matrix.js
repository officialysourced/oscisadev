const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'OSCISADEV';
const fontSize = 16;
const columns = canvas.width / fontSize;

const drops = [];
for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

let matrixColor = '#747f8d';

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = matrixColor;
    ctx.font = `${fontSize}px 'Rubik', monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 33);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const newColumns = canvas.width / fontSize;
    drops.length = newColumns;
    for (let i = 0; i < newColumns; i++) {
        if (drops[i] === undefined) {
            drops[i] = 1;
        }
    }
});

const DISCORD_USER_ID = '1390917176981979228';

async function fetchDiscordData() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const data = await response.json();
        if (data.success && data.data) {
            return data.data;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

function updatePFP(userData) {
    const pfpImage = document.getElementById('discord-pfp');
    if (pfpImage && userData.discord_user && userData.discord_user.avatar) {
        const avatarHash = userData.discord_user.avatar;
        const userId = userData.discord_user.id;
        const pfpUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=256`;
        pfpImage.src = pfpUrl;
        pfpImage.alt = `${userData.discord_user.username}'s Profile Picture`;
    } else if (pfpImage) {
        pfpImage.src = "placeholder.png";
        pfpImage.alt = "Discord Profile Picture (unavailable)";
    }
}

function updateStatus(userData) {
    const statusTextElement = document.getElementById('discord-status-text');
    const statusDotElement = document.getElementById('discord-status-dot');
    const pfpImage = document.getElementById('discord-pfp');

    if (statusTextElement && statusDotElement && pfpImage && userData.discord_status) {
        let statusText = userData.discord_status;
        let statusClass = '';

        switch (statusText) {
            case 'online':
                statusText = 'Online';
                statusClass = 'status-online';
                matrixColor = '#43b581';
                break;
            case 'idle':
                statusText = 'Idle';
                statusClass = 'status-idle';
                matrixColor = '#faa61a';
                break;
            case 'dnd':
                statusText = 'Do Not Disturb';
                statusClass = 'status-dnd';
                matrixColor = '#f04747';
                break;
            case 'offline':
            default:
                statusText = 'Offline';
                statusClass = 'status-offline';
                matrixColor = '#747f8d';
                break;
        }
        statusTextElement.textContent = statusText;
        statusDotElement.className = 'status-dot ' + statusClass;
        pfpImage.className = 'avatar-image ' + statusClass;
    } else {
        if (statusTextElement) statusTextElement.textContent = 'Unknown';
        if (statusDotElement) statusDotElement.className = 'status-dot';
        if (pfpImage) pfpImage.className = 'avatar-image';
        matrixColor = '#747f8d';
    }
}

function updateActivity(userData) {
    const activityElement = document.getElementById('discord-activity-text');
    if (activityElement) {
        activityElement.innerHTML = '';
        if (userData.activities && userData.activities.length > 0) {
            const displayableActivities = userData.activities.filter(activity =>
                activity.type !== 4
            );

            if (displayableActivities.length > 0) {
                const activity = displayableActivities[0];
                let activityString = '';
                switch (activity.type) {
                    case 0:
                        activityString = `Playing ${activity.name}`;
                        if (activity.details) activityString += `: ${activity.details}`;
                        break;
                    case 1:
                        activityString = `Streaming ${activity.name}`;
                        if (activity.details) activityString += `: ${activity.details}`;
                        break;
                    case 2:
                        if (activity.name === 'Spotify' && activity.details && activity.state) {
                            activityString = `Listening to ${activity.details} by ${activity.state}`;
                        } else {
                            activityString = `Listening to ${activity.name}`;
                            if (activity.state) activityString += ` by ${activity.state}`;
                        }
                        break;
                    case 3:
                        activityString = `Watching ${activity.name}`;
                        if (activity.details) activityString += `: ${activity.details}`;
                        break;
                    default:
                        activityString = `Doing ${activity.name}`;
                        if (activity.details) activityString += `: ${activity.details}`;
                        break;
                }
                activityElement.textContent = activityString;
            } else {
                activityElement.textContent = 'No current activity.';
            }
        } else {
            activityElement.textContent = 'No current activity.';
        }
    }
}

async function updateDiscordDisplay() {
    const userData = await fetchDiscordData();
    if (userData) {
        updatePFP(userData);
        updateStatus(userData);
        updateActivity(userData);
    } else {
        const statusTextElement = document.getElementById('discord-status-text');
        const statusDotElement = document.getElementById('discord-status-dot');
        const activityElement = document.getElementById('discord-activity-text');
        const pfpImage = document.getElementById('discord-pfp');

        if (statusTextElement) statusTextElement.textContent = 'Unavailable';
        if (statusDotElement) statusDotElement.className = 'status-dot status-offline';
        if (pfpImage) {
            pfpImage.src = "placeholder.png";
            pfpImage.alt = "Discord Profile Picture (unavailable)";
            pfpImage.className = 'avatar-image status-offline';
        }
        if (activityElement) activityElement.textContent = 'Discord data unavailable.';
        matrixColor = '#747f8d';
    }
}

updateDiscordDisplay();
setInterval(updateDiscordDisplay, 2 * 1000);