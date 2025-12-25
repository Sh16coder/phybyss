// ========== GLOBAL VARIABLES ==========
let currentUser = null;
let isTeacher = false;
let onlineUsers = {};
let activeSimulation = null;
let physicsFacts = [];

// ========== PHYSICS FACTS DATABASE ==========
const PHYSICS_FACTS = [
    "The speed of light is approximately 299,792,458 meters per second - the fastest speed possible in the universe!",
    "Neutron stars are so dense that a teaspoon of their material would weigh about 10 million tons on Earth.",
    "Quantum entanglement allows particles to instantly affect each other regardless of distance - Einstein called it 'spooky action at a distance'.",
    "Time dilation means time passes slower in strong gravitational fields and at high velocities.",
    "A lightning bolt can reach temperatures of 30,000°C - that's hotter than the surface of the sun!",
    "The universe is expanding at an accelerating rate, driven by mysterious dark energy.",
    "Electrons can exist in multiple places at once due to quantum superposition.",
    "Black holes have such strong gravity that not even light can escape from them.",
    "The uncertainty principle states you cannot know both the position and momentum of a particle precisely.",
    "Every action has an equal and opposite reaction - Newton's Third Law of Motion.",
    "Sound travels about 4.3 times faster in water than in air.",
    "Absolute zero (-273.15°C) is the theoretical temperature where all molecular motion stops.",
    "A day on Venus is longer than its year - it rotates slower than it orbits the sun.",
    "The Great Red Spot on Jupiter is a storm that has been raging for over 350 years.",
    "Light behaves as both a particle and a wave - this is called wave-particle duality."
];

// ========== SIMULATION LINKS ==========
const SIMULATION_LINKS = {
    pendulum: "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html",
    circuit: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html",
    optics: "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html",
    thermo: "https://phet.colorado.edu/sims/html/gases-intro/latest/gases-intro_all.html"
};

// ========== DOM ELEMENTS ==========
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const liveNotification = document.getElementById('liveNotification');
const notificationText = document.getElementById('notificationText');
const formulaHelper = document.getElementById('formulaHelper');

// ========== INITIALIZE APPLICATION ==========
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Initialize physics facts
    initializePhysicsFacts();
    
    // Check authentication state
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            isTeacher = user.email === TEACHER_EMAIL;
            setupUser(user);
            showDashboard();
            setupRealtimeListeners();
            updateOnlineStatus(true);
            showNotification('Welcome to Physics Classroom! 🚀', 'success');
        } else {
            showLoginScreen();
        }
    });

    // Setup event listeners
    setupEventListeners();
    
    // Initialize particles background
    initParticles();
    
    // Update physics fact
    updatePhysicsFact();
    
    // Setup formula helper
    setupFormulaHelper();
}

// ========== PARTICLE BACKGROUND ==========
function initParticles() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;

    for (let i = 0; i < 50; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 5 + 1;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    const color = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.3 + 0.1})`;
    
    // Apply styles
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${posX}%;
        top: ${posY}%;
        box-shadow: 0 0 ${size * 2}px ${color};
        animation: particleFloat ${duration}s linear ${delay}s infinite;
    `;
    
    container.appendChild(particle);
}

// Add particle animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========== EVENT LISTENERS SETUP ==========
function setupEventListeners() {
    // Authentication
    loginBtn.addEventListener('click', loginUser);
    registerBtn.addEventListener('click', registerUser);
    logoutBtn.addEventListener('click', logoutUser);
    showRegister.addEventListener('click', showRegisterForm);
    showLogin.addEventListener('click', showLoginForm);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Community Chat
    document.getElementById('sendCommunityMsg').addEventListener('click', sendCommunityMessage);
    document.getElementById('communityMessage').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendCommunityMessage();
        }
    });
    
    // Topic selection
    document.getElementById('topicSelect').addEventListener('change', filterMessagesByTopic);
    
    // Message actions
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleMessageAction(e.target.dataset.action);
        });
    });
    
    // Teacher functionality
    document.getElementById('addAssignmentBtn')?.addEventListener('click', addAssignment);
    document.getElementById('addResourceBtn')?.addEventListener('click', addResource);
    document.getElementById('askDoubtBtn')?.addEventListener('click', askDoubt);
    
    // Resource filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterResources(btn.dataset.filter);
        });
    });
    
    // Doubt filters
    document.querySelectorAll('.doubt-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            filterDoubts(btn.dataset.filter);
        });
    });
    
    // Formula helper
    document.querySelector('.close-helper')?.addEventListener('click', () => {
        formulaHelper.classList.remove('show');
    });
    
    document.querySelectorAll('.formula-item').forEach(item => {
        item.addEventListener('click', (e) => {
            insertFormula(e.target.dataset.formula);
        });
    });
    
    // Auto-hide notification
    liveNotification.addEventListener('click', () => {
        liveNotification.classList.remove('show');
    });
}

// ========== AUTHENTICATION FUNCTIONS ==========
async function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showNotification('Welcome to Physics Classroom! 🎯', 'success');
    } catch (error) {
        handleAuthError(error);
    }
}

async function registerUser() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const branch = document.getElementById('physicsBranch').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user profile in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            branch: branch,
            role: email === TEACHER_EMAIL ? 'teacher' : 'student',
            appId: APP_ID,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification('Welcome to Physics Club! 🚀', 'success');
    } catch (error) {
        handleAuthError(error);
    }
}

async function logoutUser() {
    try {
        await updateOnlineStatus(false);
        await auth.signOut();
        showNotification('Logged out successfully 👋', 'success');
    } catch (error) {
        showNotification('Error during logout', 'error');
    }
}

function handleAuthError(error) {
    let message = 'Authentication failed';
    
    switch (error.code) {
        case 'auth/invalid-email':
            message = 'Invalid email address';
            break;
        case 'auth/user-disabled':
            message = 'Account has been disabled';
            break;
        case 'auth/user-not-found':
            message = 'No account found with this email';
            break;
        case 'auth/wrong-password':
            message = 'Incorrect password';
            break;
        case 'auth/email-already-in-use':
            message = 'Email is already registered';
            break;
        case 'auth/weak-password':
            message = 'Password is too weak';
            break;
        default:
            message = error.message;
    }
    
    showNotification(message, 'error');
}

// ========== USER MANAGEMENT ==========
async function setupUser(user) {
    // Update UI with user info
    const displayName = user.displayName || user.email.split('@')[0];
    document.getElementById('userGreeting').textContent = `Welcome, ${displayName}`;
    
    // Update avatar
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
        avatar.innerHTML = isTeacher ? '<i class="fas fa-chalkboard-teacher"></i>' : initials;
        avatar.style.background = isTeacher ? 
            'linear-gradient(135deg, #ffc107, #ff9800)' : 
            'linear-gradient(135deg, #00b7ff, #9c27b0)';
    }
    
    // Update role badge
    const badge = document.getElementById('userRoleBadge');
    if (badge) {
        if (isTeacher) {
            badge.innerHTML = '<i class="fas fa-chalkboard-teacher"></i><span>Professor</span>';
            badge.style.background = 'rgba(255, 193, 7, 0.2)';
            badge.style.borderColor = 'rgba(255, 193, 7, 0.3)';
            
            // Show teacher-only forms
            document.getElementById('teacherAssignmentForm').style.display = 'block';
            document.getElementById('teacherResourceForm').style.display = 'block';
        } else {
            badge.innerHTML = '<i class="fas fa-user-graduate"></i><span>Physics Student</span>';
            badge.style.background = 'rgba(0, 183, 255, 0.2)';
            badge.style.borderColor = 'rgba(0, 183, 255, 0.3)';
        }
    }
    
    // Ensure user document exists and update
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
        await userRef.set({
            name: displayName,
            email: user.email,
            branch: 'general',
            role: isTeacher ? 'teacher' : 'student',
            appId: APP_ID,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
    } else {
        await userRef.update({
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

// ========== ONLINE STATUS MANAGEMENT ==========
async function updateOnlineStatus(isOnline) {
    if (!currentUser) return;
    
    const status = {
        userId: currentUser.uid,
        name: currentUser.displayName || currentUser.email.split('@')[0],
        email: currentUser.email,
        branch: 'physics',
        isOnline: isOnline,
        role: isTeacher ? 'teacher' : 'student',
        appId: APP_ID,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('onlineUsers').doc(currentUser.uid).set(status, { merge: true });
}

// ========== REALTIME LISTENERS ==========
function setupRealtimeListeners() {
    // Listen for online users (Physics Classroom only)
    db.collection('onlineUsers')
        .where('appId', '==', APP_ID)
        .where('isOnline', '==', true)
        .onSnapshot(snapshot => {
            onlineUsers = {};
            let onlineCount = 0;
            
            snapshot.forEach(doc => {
                const user = doc.data();
                onlineUsers[doc.id] = user;
                if (user.isOnline) onlineCount++;
            });
            
            updateOnlineUsersList();
            document.getElementById('onlineCount').textContent = onlineCount;
            document.getElementById('chatOnline').textContent = onlineCount;
        });
    
    // Listen for community messages
    db.collection('community')
        .where('appId', '==', APP_ID)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .onSnapshot(snapshot => {
            const messagesContainer = document.getElementById('communityMessages');
            
            if (snapshot.empty) {
                messagesContainer.innerHTML = `
                    <div class="welcome-message">
                        <i class="fas fa-atom"></i>
                        <h3>Welcome to Physics Forum!</h3>
                        <p>Start discussing physics concepts, problems, and theories</p>
                    </div>
                `;
                return;
            }
            
            messagesContainer.innerHTML = '';
            snapshot.forEach(doc => {
                displayMessage(doc.data());
            });
            
            // Update message count
            document.getElementById('messageCount').textContent = snapshot.size;
            document.getElementById('totalMessages').textContent = snapshot.size;
        });
    
    // Listen for assignments
    db.collection('assignments')
        .where('appId', '==', APP_ID)
        .orderBy('createdAt', 'desc')
        .onSnapshot(updateAssignmentsList);
    
    // Listen for resources
    db.collection('resources')
        .where('appId', '==', APP_ID)
        .orderBy('createdAt', 'desc')
        .onSnapshot(updateResourcesList);
    
    // Listen for doubts
    db.collection('doubts')
        .where('appId', '==', APP_ID)
        .orderBy('createdAt', 'desc')
        .onSnapshot(updateDoubtsList);
    
    // Listen for user activity
    db.collection('users')
        .where('appId', '==', APP_ID)
        .onSnapshot(snapshot => {
            document.getElementById('totalStudents').textContent = snapshot.size;
        });
}

// ========== COMMUNITY CHAT ==========
async function sendCommunityMessage() {
    if (!currentUser) return;
    
    const input = document.getElementById('communityMessage');
    const message = input.value.trim();
    const topic = document.getElementById('topicSelect').value;
    
    if (!message) {
        showNotification('Please enter a message', 'warning');
        return;
    }
    
    try {
        await db.collection('community').add({
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email.split('@')[0],
            userEmail: currentUser.email,
            userRole: isTeacher ? 'teacher' : 'student',
            content: message,
            topic: topic,
            appId: APP_ID,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        input.value = '';
        input.focus();
    } catch (error) {
        showNotification('Failed to send message', 'error');
        console.error('Error sending message:', error);
    }
}

function displayMessage(message) {
    const messagesContainer = document.getElementById('communityMessages');
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.userRole}`;
    
    const time = message.timestamp?.toDate() || new Date();
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = time.toLocaleDateString();
    
    // Check if message contains formulas (simple detection)
    const hasFormula = message.content.match(/[a-zA-Z]\s*=\s*[a-zA-Z0-9]|F\s*=\s*ma|E\s*=\s*mc²|V\s*=\s*IR/);
    
    messageElement.innerHTML = `
        <div class="message-header">
            <div class="sender-info">
                <span class="sender-name">
                    ${message.userName} 
                    ${message.userRole === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
                </span>
                <span class="message-topic">#${message.topic || 'general'}</span>
            </div>
            <span class="message-time" title="${dateString}">${timeString}</span>
        </div>
        <div class="message-content">
            ${message.content}
            ${hasFormula ? `<div class="message-formula">${hasFormula[0]}</div>` : ''}
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    
    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function filterMessagesByTopic() {
    const topic = document.getElementById('topicSelect').value;
    const messages = document.querySelectorAll('.message');
    
    messages.forEach(msg => {
        const msgTopic = msg.querySelector('.message-topic')?.textContent.replace('#', '');
        msg.style.display = (topic === 'all' || msgTopic === topic) ? 'block' : 'none';
    });
}

function handleMessageAction(action) {
    switch(action) {
        case 'formula':
            showFormulaHelper();
            break;
        case 'diagram':
            showNotification('Diagram feature coming soon! 📐', 'info');
            break;
        case 'question':
            document.getElementById('communityMessage').value += '❓ Question: ';
            document.getElementById('communityMessage').focus();
            break;
    }
}

// ========== VIRTUAL LAB ==========
function openSimulation(type) {
    if (!SIMULATION_LINKS[type]) {
        showNotification('Simulation not available', 'error');
        return;
    }
    
    activeSimulation = type;
    const simulationArea = document.getElementById('simulationArea');
    const simulationFrame = document.getElementById('simulationFrame');
    const simulationTitle = document.getElementById('simulationTitle');
    
    // Set title
    const titles = {
        pendulum: 'Simple Pendulum Simulation',
        circuit: 'Circuit Construction Kit',
        optics: 'Light Bending Simulation',
        thermo: 'Gas Properties Simulation'
    };
    
    simulationTitle.textContent = titles[type] || 'Physics Simulation';
    
    // Create iframe for simulation
    simulationFrame.innerHTML = `
        <iframe 
            src="${SIMULATION_LINKS[type]}" 
            width="100%" 
            height="100%" 
            frameborder="0"
            allowfullscreen
            style="border-radius: 15px;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
    `;
    
    // Show simulation area
    simulationArea.style.display = 'block';
    simulationArea.scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Launching virtual lab experiment! 🔬', 'success');
}

function closeSimulation() {
    const simulationArea = document.getElementById('simulationArea');
    simulationArea.style.display = 'none';
    activeSimulation = null;
}

// ========== ASSIGNMENTS ==========
async function addAssignment() {
    if (!isTeacher) {
        showNotification('Only teachers can create assignments', 'error');
        return;
    }
    
    const title = document.getElementById('assignmentTitle').value.trim();
    const description = document.getElementById('assignmentDescription').value.trim();
    const dueDate = document.getElementById('assignmentDueDate').value;
    const topic = document.getElementById('assignmentTopic').value;
    const weight = document.getElementById('assignmentWeight').value;
    const resources = document.getElementById('assignmentResources').value.trim();
    
    if (!title || !description) {
        showNotification('Please fill required fields', 'warning');
        return;
    }
    
    try {
        await db.collection('assignments').add({
            title: title,
            description: description,
            dueDate: dueDate,
            topic: topic,
            weight: parseInt(weight),
            resources: resources,
            teacherName: 'Shivam Soni',
            teacherId: currentUser.uid,
            appId: APP_ID,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });
        
        // Clear form
        ['assignmentTitle', 'assignmentDescription', 'assignmentDueDate', 'assignmentResources'].forEach(id => {
            document.getElementById(id).value = '';
        });
        
        showNotification('Assignment published successfully! 📚', 'success');
    } catch (error) {
        showNotification('Failed to create assignment', 'error');
        console.error('Error creating assignment:', error);
    }
}

function updateAssignmentsList(snapshot) {
    const container = document.getElementById('assignmentsList');
    container.innerHTML = '';
    
    if (snapshot.empty) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>No Assignments Yet</h3>
                <p>Check back later for physics problems</p>
            </div>
        `;
        return;
    }
    
    let count = 0;
    snapshot.forEach(doc => {
        const assignment = doc.data();
        const assignmentElement = createAssignmentCard(assignment);
        container.appendChild(assignmentElement);
        count++;
    });
    
    document.getElementById('totalAssignments').textContent = count;
}

function createAssignmentCard(assignment) {
    const element = document.createElement('div');
    element.className = 'assignment-card';
    
    const dueDate = assignment.dueDate ? 
        new Date(assignment.dueDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }) : 
        'No due date';
    
    const topicNames = {
        mechanics: 'Classical Mechanics',
        electro: 'Electromagnetism',
        thermo: 'Thermodynamics',
        optics: 'Optics',
        modern: 'Modern Physics'
    };
    
    element.innerHTML = `
        <div class="assignment-header">
            <h3 class="assignment-title">
                <i class="fas fa-book"></i>
                ${assignment.title}
            </h3>
            <div class="assignment-meta">
                <span class="assignment-topic">${topicNames[assignment.topic] || assignment.topic}</span>
                <span class="assignment-due">Due: ${dueDate}</span>
                <span class="assignment-weight">${assignment.weight}% Weightage</span>
            </div>
        </div>
        
        <div class="assignment-description">
            ${assignment.description}
        </div>
        
        ${assignment.resources ? `
            <div class="assignment-resources">
                <a href="${assignment.resources}" target="_blank" class="drive-link">
                    <i class="fab fa-google-drive"></i> Reference Materials
                </a>
            </div>
        ` : ''}
        
        <div class="assignment-footer">
            <small>Published by: <strong>${assignment.teacherName || 'Shivam Soni'}</strong></small>
        </div>
    `;
    
    return element;
}

// ========== RESOURCES MANAGEMENT ==========
async function addResource() {
    if (!isTeacher) {
        showNotification('Only teachers can upload resources', 'error');
        return;
    }
    
    const title = document.getElementById('resourceTitle').value.trim();
    const description = document.getElementById('resourceDescription').value.trim();
    const link = document.getElementById('resourceLink').value.trim();
    const type = document.getElementById('resourceType').value;
    const branch = document.getElementById('resourceBranch').value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    if (!title || !link) {
        showNotification('Title and link are required', 'warning');
        return;
    }
    
    if (!link.includes('drive.google.com')) {
        showNotification('Please provide a valid Google Drive link', 'error');
        return;
    }
    
    try {
        await db.collection('resources').add({
            title: title,
            description: description,
            link: link,
            type: type,
            branch: branch,
            difficulty: difficulty,
            teacherName: 'Shivam Soni',
            teacherId: currentUser.uid,
            appId: APP_ID,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            downloads: 0
        });
        
        // Clear form
        ['resourceTitle', 'resourceDescription', 'resourceLink'].forEach(id => {
            document.getElementById(id).value = '';
        });
        
        showNotification('Resource uploaded successfully! 📁', 'success');
    } catch (error) {
        showNotification('Failed to upload resource', 'error');
        console.error('Error uploading resource:', error);
    }
}

function updateResourcesList(snapshot) {
    const container = document.getElementById('resourcesList');
    container.innerHTML = '';
    
    if (snapshot.empty) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>No Resources Available</h3>
                <p>Check back later for study materials</p>
            </div>
        `;
        return;
    }
    
    snapshot.forEach(doc => {
        const resource = doc.data();
        const resourceElement = createResourceCard(resource);
        container.appendChild(resourceElement);
    });
}

function createResourceCard(resource) {
    const element = document.createElement('div');
    element.className = 'resource-card';
    element.dataset.type = resource.type;
    element.dataset.branch = resource.branch;
    
    // Convert Google Drive link to embed
    let embedLink = resource.link;
    if (embedLink.includes('/file/d/')) {
        const fileId = embedLink.split('/file/d/')[1].split('/')[0];
        embedLink = `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    const typeIcons = {
        lecture: 'fas fa-chalkboard-teacher',
        video: 'fas fa-video',
        book: 'fas fa-book',
        solved: 'fas fa-file-alt',
        presentation: 'fas fa-chart-bar',
        formula: 'fas fa-square-root-alt'
    };
    
    const branchNames = {
        mechanics: 'Mechanics',
        electro: 'Electromagnetism',
        thermo: 'Thermodynamics',
        optics: 'Optics',
        quantum: 'Quantum Physics',
        astro: 'Astrophysics'
    };
    
    const typeNames = {
        lecture: 'Lecture Notes',
        video: 'Video Lecture',
        book: 'E-Book',
        solved: 'Solved Papers',
        presentation: 'Presentation',
        formula: 'Formula Sheet'
    };
    
    element.innerHTML = `
        <div class="resource-header">
            <h3 class="resource-title">
                <i class="${typeIcons[resource.type] || 'fas fa-file'}"></i>
                ${resource.title}
            </h3>
            <div class="resource-meta">
                <span class="resource-type">${typeNames[resource.type] || resource.type}</span>
                <span class="resource-branch">${branchNames[resource.branch] || resource.branch}</span>
                <span class="resource-difficulty ${resource.difficulty}">
                    ${resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                </span>
            </div>
        </div>
        
        <div class="resource-body">
            <div class="resource-description">
                ${resource.description || 'No description provided.'}
            </div>
            
            <div class="drive-embed">
                <iframe 
                    src="${embedLink}" 
                    width="100%" 
                    height="400" 
                    frameborder="0"
                    allow="autoplay"
                    style="border-radius: 15px;"
                ></iframe>
            </div>
            
            <a href="${resource.link}" target="_blank" class="drive-link">
                <i class="fab fa-google-drive"></i> Open in Google Drive
            </a>
        </div>
    `;
    
    return element;
}

function filterResources(filter) {
    const resources = document.querySelectorAll('.resource-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    // Filter resources
    resources.forEach(resource => {
        if (filter === 'all' || resource.dataset.type === filter) {
            resource.style.display = 'block';
        } else {
            resource.style.display = 'none';
        }
    });
}

// ========== DOUBTS MANAGEMENT ==========
async function askDoubt() {
    if (!currentUser) return;
    
    const question = document.getElementById('doubtQuestion').value.trim();
    const topic = document.getElementById('doubtTopic').value;
    const urgency = document.getElementById('doubtUrgency').value;
    
    if (!question) {
        showNotification('Please enter your doubt', 'warning');
        return;
    }
    
    try {
        await db.collection('doubts').add({
            question: question,
            topic: topic,
            urgency: urgency,
            studentId: currentUser.uid,
            studentName: currentUser.displayName || currentUser.email.split('@')[0],
            studentEmail: currentUser.email,
            appId: APP_ID,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            answers: []
        });
        
        document.getElementById('doubtQuestion').value = '';
        showNotification('Doubt submitted successfully! 🙋', 'success');
    } catch (error) {
        showNotification('Failed to submit doubt', 'error');
        console.error('Error submitting doubt:', error);
    }
}

function updateDoubtsList(snapshot) {
    const container = document.getElementById('doubtsList');
    container.innerHTML = '';
    
    if (snapshot.empty) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>No Questions Yet</h3>
                <p>Be the first to ask a physics question!</p>
            </div>
        `;
        return;
    }
    
    let pendingCount = 0;
    snapshot.forEach(doc => {
        const doubt = doc.data();
        const doubtElement = createDoubtCard(doubt);
        container.appendChild(doubtElement);
        
        if (doubt.status === 'pending') pendingCount++;
    });
    
    document.getElementById('totalDoubts').textContent = pendingCount;
}

function createDoubtCard(doubt) {
    const element = document.createElement('div');
    element.className = 'doubt-item';
    element.dataset.status = doubt.status;
    element.dataset.urgency = doubt.urgency;
    element.dataset.student = doubt.studentId;
    
    const time = doubt.createdAt?.toDate() || new Date();
    const timeString = time.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const topicNames = {
        general: 'General Physics',
        mechanics: 'Mechanics',
        electro: 'Electromagnetism',
        thermo: 'Thermodynamics',
        optics: 'Optics',
        quantum: 'Quantum Physics'
    };
    
    element.innerHTML = `
        <div class="doubt-header">
            <div class="doubt-student">
                <div class="student-avatar">
                    ${doubt.studentName.charAt(0).toUpperCase()}
                </div>
                <div class="student-info">
                    <h4>${doubt.studentName}</h4>
                    <p>${doubt.studentEmail}</p>
                </div>
            </div>
            <div class="doubt-meta">
                <span class="doubt-topic">${topicNames[doubt.topic] || doubt.topic}</span>
                <span class="doubt-urgency ${doubt.urgency}">${doubt.urgency}</span>
                <span class="doubt-time" title="${time.toLocaleString()}">${timeString}</span>
            </div>
        </div>
        
        <div class="doubt-question">
            ${doubt.question}
        </div>
        
        ${doubt.answers && doubt.answers.length > 0 ? doubt.answers.map(answer => `
            <div class="doubt-answer">
                <div class="answer-header">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <strong>${answer.teacherName || 'Shivam Soni'}</strong>
                </div>
                <div class="answer-content">
                    ${answer.answer}
                </div>
                <div class="answer-time">
                    Answered on ${answer.answeredAt?.toDate().toLocaleDateString()}
                </div>
            </div>
        `).join('') : `
            <div class="no-answer">
                <i class="fas fa-clock"></i> Waiting for teacher response...
            </div>
        `}
    `;
    
    return element;
}

function filterDoubts(filter) {
    const doubts = document.querySelectorAll('.doubt-item');
    const filterButtons = document.querySelectorAll('.doubt-filter');
    
    // Update active filter button
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    // Filter doubts
    doubts.forEach(doubt => {
        let show = false;
        
        switch(filter) {
            case 'all':
                show = true;
                break;
            case 'unanswered':
                show = doubt.dataset.status === 'pending';
                break;
            case 'answered':
                show = doubt.dataset.status === 'answered';
                break;
            case 'my':
                show = doubt.dataset.student === currentUser?.uid;
                break;
        }
        
        doubt.style.display = show ? 'block' : 'none';
    });
}

// ========== STUDENTS MANAGEMENT ==========
function updateOnlineUsersList() {
    const container = document.getElementById('studentsList');
    container.innerHTML = '';
    
    if (Object.keys(onlineUsers).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <h3>No Students Online</h3>
                <p>Be the first to join the Physics Club!</p>
            </div>
        `;
        return;
    }
    
    // Sort: teacher first, then by name
    const sortedUsers = Object.values(onlineUsers).sort((a, b) => {
        if (a.role === 'teacher' && b.role !== 'teacher') return -1;
        if (a.role !== 'teacher' && b.role === 'teacher') return 1;
        return a.name.localeCompare(b.name);
    });
    
    sortedUsers.forEach(user => {
        const studentElement = createStudentCard(user);
        container.appendChild(studentElement);
    });
    
    updateTopContributors();
}

function createStudentCard(user) {
    const element = document.createElement('div');
    element.className = 'student-card';
    
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const isUserTeacher = user.role === 'teacher';
    const branchNames = {
        classical: 'Classical Mechanics',
        modern: 'Modern Physics',
        electro: 'Electromagnetism',
        quantum: 'Quantum Physics',
        thermo: 'Thermodynamics',
        general: 'General Physics'
    };
    
    element.innerHTML = `
        <div class="student-avatar">
            ${isUserTeacher ? '👨‍🏫' : initials}
        </div>
        <div class="student-info">
            <h4>${user.name} ${isUserTeacher ? ' (Professor)' : ''}</h4>
            <p>${user.email}</p>
            <span class="student-branch">${branchNames[user.branch] || user.branch}</span>
        </div>
        <div class="online-dot"></div>
    `;
    
    return element;
}

function updateTopContributors() {
    const container = document.getElementById('topContributors');
    if (!container) return;
    
    // This is a simplified version - in production, you'd calculate based on actual activity
    const sampleContributors = [
        { name: 'Alex Johnson', score: 156 },
        { name: 'Sarah Miller', score: 142 },
        { name: 'Mike Chen', score: 128 },
        { name: 'Emma Wilson', score: 115 }
    ];
    
    container.innerHTML = sampleContributors.map((contributor, index) => `
        <div class="contributor">
            <div class="contributor-rank">${index + 1}</div>
            <div class="contributor-name">${contributor.name}</div>
            <div class="contributor-score">${contributor.score} pts</div>
        </div>
    `).join('');
}

// ========== PHYSICS FACTS ==========
function initializePhysicsFacts() {
    physicsFacts = [...PHYSICS_FACTS];
}

function updatePhysicsFact() {
    const factElement = document.getElementById('physicsFact');
    if (!factElement || physicsFacts.length === 0) return;
    
    // Pick a random fact
    const randomIndex = Math.floor(Math.random() * physicsFacts.length);
    const fact = physicsFacts[randomIndex];
    
    factElement.innerHTML = `
        <i class="fas fa-atom"></i>
        <p>${fact}</p>
    `;
    
    // Update every 30 seconds
    setTimeout(updatePhysicsFact, 30000);
}

// ========== FORMULA HELPER ==========
function setupFormulaHelper() {
    // Show formula helper when formula button is clicked
    document.querySelector('[data-action="formula"]')?.addEventListener('click', showFormulaHelper);
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!formulaHelper.contains(e.target) && !e.target.closest('[data-action="formula"]')) {
            formulaHelper.classList.remove('show');
        }
    });
}

function showFormulaHelper() {
    formulaHelper.classList.add('show');
}

function insertFormula(formula) {
    const input = document.getElementById('communityMessage');
    input.value += ` ${formula} `;
    input.focus();
    formulaHelper.classList.remove('show');
    showNotification('Formula added to message 🧮', 'success');
}

// ========== TAB NAVIGATION ==========
function switchTab(tabName) {
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Show selected tab
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === tabName + 'Tab') {
            tab.classList.add('active');
            
            // Special handling for specific tabs
            if (tabName === 'community') {
                const messagesContainer = document.getElementById('communityMessages');
                if (messagesContainer) {
                    setTimeout(() => {
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }, 100);
                }
            }
        }
    });
    
    // Update browser URL (optional)
    history.pushState(null, null, `#${tabName}`);
}

// ========== SCREEN MANAGEMENT ==========
function showDashboard() {
    loginScreen.classList.remove('active');
    dashboard.classList.add('active');
    
    // Update physics fact when showing dashboard
    updatePhysicsFact();
}

function showLoginScreen() {
    dashboard.classList.remove('active');
    loginScreen.classList.add('active');
    
    // Reset forms
    document.querySelector('.login-form').style.display = 'block';
    document.querySelector('.register-form').style.display = 'none';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function showRegisterForm(e) {
    e.preventDefault();
    document.querySelector('.login-form').style.display = 'none';
    document.querySelector('.register-form').style.display = 'block';
}

function showLoginForm(e) {
    e.preventDefault();
    document.querySelector('.login-form').style.display = 'block';
    document.querySelector('.register-form').style.display = 'none';
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info') {
    // Update notification text
    notificationText.textContent = message;
    
    // Set color based on type
    const notification = liveNotification;
    notification.className = 'live-notification show';
    
    switch(type) {
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f44336, #c62828)';
            break;
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #2196f3, #1565c0)';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// ========== WINDOW EVENT HANDLERS ==========
window.addEventListener('beforeunload', async () => {
    if (currentUser) {
        await updateOnlineStatus(false);
    }
});

window.addEventListener('online', () => {
    showNotification('Back online! ✅', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are offline 📴', 'warning');
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        switchTab(hash);
    }
});

// ========== INITIAL TAB ==========
switchTab('community');

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + / to toggle formula helper
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        formulaHelper.classList.toggle('show');
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        formulaHelper.classList.remove('show');
        if (activeSimulation) {
            closeSimulation();
        }
    }
    
    // Number keys 1-6 for quick tab switching
    if (e.key >= '1' && e.key <= '6' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tabs = ['community', 'experiments', 'homework', 'resources', 'doubts', 'students'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
            switchTab(tabs[tabIndex]);
        }
    }
});

// ========== UTILITY FUNCTIONS ==========
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ========== FIREBASE ERROR HANDLING ==========
function handleFirebaseError(error) {
    console.error('Firebase Error:', error);
    
    let message = 'An error occurred';
    if (error.code === 'permission-denied') {
        message = 'You do not have permission to perform this action';
    } else if (error.code === 'unavailable') {
        message = 'Network error. Please check your connection';
    }
    
    showNotification(message, 'error');
}
