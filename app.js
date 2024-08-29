let scene, camera, renderer;
let particles, glass, glowingEdges;
const particleCount = 50000;

// Adjustable parameters for glowing edges
const glowingEdgesParams = {
    color: 0xffffff,     // Color of the glowing edges
    opacity: 0.5,          // Opacity of the glowing edges (0-1)
    linewidth: 100,        // Width of the glowing edges
    glowIntensity: 0.1     // Intensity of the glow effect
};

// Adjustable parameters for product grid
const productGridParams = {
    columns: 4,          // Number of columns in the product grid
    spacing: 90,         // Spacing between products (in pixels)
    itemSize: 220        // Size of each product item (width and height in pixels)
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    createParticles();
    createGlass();
    initWelcomeScreen();
    initProductDisplay();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 50;

    animate();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color = new THREE.Color(0xd4af37);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * window.innerWidth * 0.1;
        positions[i3 + 1] = Math.random() * window.innerHeight * 0.1;
        positions[i3 + 2] = (Math.random() - 0.5) * 50;

        color.toArray(colors, i3);

        sizes[i] = Math.random() * 0.05 + 0.02;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createGlass() {
    const width = window.innerWidth * 8.5;
    const height = window.innerHeight * 8.5;
    const geometry = new THREE.PlaneGeometry(width * 0.01, height * 0.01);
    
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 10,
        metalness: 2,
        roughness: 1,
        transmission: 19,
        thickness: 5,
    });

    glass = new THREE.Mesh(geometry, material);
    glass.position.z = 10;
    scene.add(glass);

    // Create glowing edges
    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: glowingEdgesParams.color,
        linewidth: glowingEdgesParams.linewidth,
        transparent: true,
        opacity: glowingEdgesParams.opacity
    });
    glowingEdges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    glowingEdges.position.z = 11.1;
    scene.add(glowingEdges);

    // Add glow effect
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(glowingEdgesParams.color) },
            glowIntensity: { value: glowingEdgesParams.glowIntensity }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 2.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float glowIntensity;
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
                gl_FragColor = vec4(color, intensity * glowIntensity);
            }
        `,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    const glowMesh = new THREE.Mesh(geometry, glowMaterial);
    glowMesh.position.z = 11.10;
    glowMesh.scale.multiplyScalar(1.1);
    scene.add(glowMesh);
}

function initWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    //logo
    setTimeout(() => {
        gsap.to(welcomeScreen, {
            opacity: 1,
            duration: 2,
            onComplete: () => {
                welcomeScreen.classList.add('hidden');
                showProductGrid();
            }
        });
    }, 10);
}

function initProductDisplay() {
    const productGrid = document.getElementById('product-grid');
    
    productGrid.style.gridTemplateColumns = `repeat(${productGridParams.columns}, 1fr)`;
    productGrid.style.gap = `${productGridParams.spacing}px`;
    
    for (let i = 1; i <= 12; i++) {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.style.width = `${productGridParams.itemSize}px`;
        productItem.style.height = `${productGridParams.itemSize}px`;
        const img = document.createElement('img');
        img.src = `product${i}.png`;
        img.alt = `Product ${i}`;
        productItem.appendChild(img);
        productGrid.appendChild(productItem);

        // Add event listeners for hover effects
        productItem.addEventListener('mouseenter', () => onProductHover(productItem));
        productItem.addEventListener('mouseleave', () => onProductLeave(productItem));
    }
}

function onProductHover(productItem) {
    gsap.to(productItem, {
        scale: 1.08,
        y: -10,
        duration: 0.5,
        ease: "elastic.out(1, 0.7)",
        boxShadow: "0 15px 30px rgba(0,0,0,0.2)"
    });
    
    gsap.to(productItem.querySelector('img'), {
        scale: 1.1,
        duration: 0.5,
        ease: "power2.out"
    });
}

function onProductLeave(productItem) {
    gsap.to(productItem, {
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.7)",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
    });
    
    gsap.to(productItem.querySelector('img'), {
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
    });
}

function showProductGrid() {
    const productGrid = document.getElementById('product-grid');
    productGrid.classList.remove('hidden');
    gsap.to(productGrid, { opacity: 100, duration: 2 });
}

function animate() {
    requestAnimationFrame(animate);

    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] -= 0.05;
        if (positions[i3 + 1] < -window.innerHeight * 0.05) {
            positions[i3] = (Math.random() - 0.5) * window.innerWidth * 0.1;
            positions[i3 + 1] = window.innerHeight * 0.05;
            positions[i3 + 2] = (Math.random() - 0.5) * 50;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

init();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const width = window.innerWidth * 0.85;
    const height = window.innerHeight * 0.85;
    glass.scale.set(width * 0.01, height * 0.01, 1);
    glowingEdges.scale.set(width * 0.01, height * 0.01, 1);
});
