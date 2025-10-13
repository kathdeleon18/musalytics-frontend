<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header
      class="w-full px-4 sm:px-8 md:px-16 py-6 flex items-center justify-between fixed top-0 z-50 transition-all duration-300"
      :class="{
        'bg-white shadow': activeSection !== 'hero',
        'bg-transparent': activeSection === 'hero'
      }"
    >
      <div class="flex items-center gap-2">
        <img src="/images/musaLogo.svg" alt="Logo" class="h-9 w-9 object-contain" />
        <h1 class="text-3xl font-bold tracking-wide text-[#283618]">MUSALYTICS</h1>
      </div>
      <!-- Desktop Navigation -->
      <nav class="hidden md:flex gap-12 text-base">
        <a
          href="#hero"
          :class="[
            'transition-colors',
            activeSection === 'hero'
              ? 'text-[#606c38] font-bold'
              : activeSection !== 'hero'
                ? 'text-gray-500 font-medium hover:text-[#606c38]'
                : 'text-white hover:text-[#606c38]'
          ]"
          @click="scrollToSection('hero', $event)"
        >
          Home
        </a>
        <a
          href="#features"
          :class="[
            'transition-colors',
            activeSection === 'features'
              ? 'text-[#606c38] font-bold'
              : activeSection !== 'hero'
                ? 'text-gray-500 font-medium hover:text-[#606c38]'
                : 'text-white hover:text-[#606c38]'
          ]"
          @click="scrollToSection('features', $event)"
        >
          Features
        </a>
        <a
          href="#knowledge"
          :class="[
            'transition-colors',
            activeSection === 'knowledge'
              ? 'text-[#606c38] font-bold'
              : activeSection !== 'hero'
                ? 'text-gray-500 font-medium hover:text-[#606c38]'
                : 'text-white hover:text-[#606c38]'
          ]"
          @click="scrollToSection('knowledge', $event)"
        >
          Knowledge
        </a>
        <a
          href="#about"
          :class="[
            'transition-colors',
            activeSection === 'about'
              ? 'text-[#606c38] font-bold'
              : activeSection !== 'hero'
                ? 'text-gray-500 font-medium hover:text-[#606c38]'
                : 'text-white hover:text-[#606c38]'
          ]"
          @click="scrollToSection('about', $event)"
        >
          About Us
        </a>
      </nav>
      <div class="flex items-center gap-4">
        <button 
          class="hidden md:flex bg-[#283618] hover:bg-[#606c38]/100 text-white hover:text-white rounded-xl px-6 py-2 text-base font-medium transition-all"
          @click="navigateToSignup"
        >
          Sign In
        </button>
        <!-- Mobile Menu Button -->
        <button
          class="md:hidden text-black focus:outline-none"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
        >
          <XIcon v-if="mobileMenuOpen" class="h-6 w-6" />
          <MenuIcon v-else class="h-6 w-6" />
        </button>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden fixed inset-0 z-40 bg-white pt-20">
      <nav class="w-full px-4 flex flex-col items-center gap-8 py-8">
        <a
          href="#hero"
          :class="[
            'text-base font-medium transition-colors',
            activeSection === 'hero' ? 'text-[#606c38] font-bold' : 'text-gray-500 hover:text-[#606c38]'
          ]"
          @click="scrollToSection('hero', $event)"
        >
          Home
        </a>
        <a
          href="#features"
          :class="[
            'text-base font-medium transition-colors',
            activeSection === 'features' ? 'text-[#606c38] font-bold' : 'text-gray-500 hover:text-[#606c38]'
          ]"
          @click="scrollToSection('features', $event)"
        >
          Features
        </a>
        <a
          href="#knowledge"
          :class="[
            'text-base font-medium transition-colors',
            activeSection === 'knowledge' ? 'text-[#606c38] font-bold' : 'text-gray-500 hover:text-[#606c38]'
          ]"
          @click="scrollToSection('knowledge', $event)"
        >
          Knowledge
        </a>
        <a
          href="#about"
          :class="[
            'text-base font-medium transition-colors',
            activeSection === 'about' ? 'text-[#606c38] font-bold' : 'text-gray-500 hover:text-[#606c38]'
          ]"
          @click="scrollToSection('about', $event)"
        >
          About Us
        </a>
        <button class="mt-4 w-full bg-[#606c38] hover:bg-[#283618] text-white px-4 py-2 rounded-xl shadow font-medium transition-all"@click="navigateToSignup">
          Sign In
        </button>
      </nav>
    </div>

    <!-- Hero Section -->
    <section 
      id="hero"
      class="w-full min-h-screen flex items-center justify-center px-4 sm:px-8 py-8 pt-20 relative overflow-hidden"
      style="background: linear-gradient(to bottom, #c9d4a3 0%, white 60%);"
    >
      <div class="w-full max-w-screen-2xl">
        <!-- Mobile Layout -->
        <div class="flex flex-col md:hidden items-center text-center space-y-6">
          <!-- Image at top - large and floating -->
          <div class="w-full flex justify-center mb-4">
            <img src="/images/musahero.svg" alt="Banana Tree" class="w-80 h-80 object-contain animate-float">
          </div>
          
          <!-- H1 Title -->
          <h1 class="text-3xl font-bold leading-tight">
            <span class="text-[#283618] font-bold">MUSALYTICS:</span>
            <span class="block mt-1 text-[#606c38]">Banana Pest & Disease Detection</span>
          </h1>
          
          <!-- First paragraph (italic) -->
          <p class="text-lg text-black font-semibold italic">"Smart Farming Starts with a Scan"</p>
          
          <!-- Buttons in one line -->
          <div class="flex gap-3 w-full justify-center">
            <button
              class="flex-1 max-w-32 hover:bg-[#606c38] bg-[#283618] text-white font-medium py-3 px-4 rounded-xl transition-all text-sm"
              @click="navigateToSignup"
            >
              Get Started
            </button>
            <button
              class="flex-1 max-w-32 bg-gray-200 hover:bg-gray-400 text-gray-800 hover:text-white font-medium py-3 px-4 rounded-xl transition-all text-sm"
              @click="scrollToSection('features')"
            >
              Learn More
            </button>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden md:flex flex-row items-center justify-between gap-12">
          <!-- LEFT SIDE: Text Content -->
          <div class="w-1/2 space-y-4 flex flex-col justify-center">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span class="text-[#283618] font-bold">MUSALYTICS:</span>
              <span class="block mt-2 text-[#606c38]">Banana Pest & Disease Detection</span>
            </h1>
            <p class="text-lg md:text-xl text-black max-w-xl font-semibold">"Smart Farming Starts with a Scan"</p>
            <p class="text-gray-800 max-w-xl leading-relaxed">
              MUSALYTICS is a CNN-Driven Detection System built to support banana farmers in the MIMAROPA Region by
              identifying common pests and diseases through image analysis. Powered by AI and designed for
              accessibility, our system provides real-time diagnostics, treatment guidance, and tools to help protect
              banana crops from early threats.
            </p>
            <div class="flex flex-wrap gap-4 pt-4">
              <button
                class="hover:bg-[#606c38] bg-[#283618] text-white font-medium py-3 px-6 rounded-xl transition-all"
                @click="navigateToSignup"
              >
                Get Started
              </button>
              <button
                class="bg-gray-200 hover:bg-gray-400 text-gray-800 hover:text-white font-medium py-3 px-6 rounded-xl transition-all"
                @click="scrollToSection('features')"
              >
                Learn More
              </button>
            </div>
          </div>
          <!-- RIGHT SIDE: Image -->
          <div class="w-1/2 flex justify-center items-center">
            <img src="/images/musahero.svg" alt="Banana Tree" class="max-w-full h-auto object-contain">
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="w-full min-h-screen bg-[#283618] flex items-center justify-center px-8 py-16">
      <div class="w-full max-w-screen-2xl">
        <!-- Section Header -->
        <div class="text-center mb-16 space-y-4">
          <div class="inline-block">
            <div class="w-16 h-1 bg-[#c9d4a3] mx-auto mb-6 rounded-full"></div>
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
              What MUSALYTICS Can Do for You
            </h2>
            <p class="text-lg md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore the powerful tools designed to detect, manage, and prevent banana crop diseases—smarter farming starts here.
            </p>
          </div>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-[#c9d4a3] transition-all">
            <div class="w-12 h-12 bg-[#c9d4a3]/20 rounded-xl flex items-center justify-center mb-4">
              <ScanIcon class="h-6 w-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">AI-Powered Detection</h3>
            <p class="text-gray-300">
              Upload images of your banana crops and get instant pest and disease identification using ResNet50 deep
              learning technology.
            </p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-[#c9d4a3] transition-all">
            <div class="w-12 h-12 bg-[#c9d4a3]/20 rounded-xl flex items-center justify-center mb-4">
              <FlaskRoundIcon class="h-6 w-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">Treatment Recommendations</h3>
            <p class="text-gray-300">
              Receive expert-verified treatment plans tailored to the specific pest or disease detected in your crop.
            </p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-[#c9d4a3] transition-all">
            <div class="w-12 h-12 bg-[#c9d4a3]/20 rounded-xl flex items-center justify-center mb-4">
              <CalendarIcon class="h-6 w-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">Task Scheduling</h3>
            <p class="text-gray-300">
              Manage your farming activities efficiently with an integrated scheduler that helps plan treatment,
              fertilization, irrigation, and monitoring tasks.
            </p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-[#c9d4a3] transition-all">
            <div class="w-12 h-12 bg-[#c9d4a3]/20 rounded-xl flex items-center justify-center mb-4">
              <CloudIcon class="h-6 w-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">Weather Alerts</h3>
            <p class="text-gray-300">
              Receive location-based weather forecasts and alerts, designed to inform farmers about potential disease
              risks related to changing climate conditions.
            </p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-[#c9d4a3] transition-all">
            <div class="w-12 h-12 bg-[#c9d4a3]/20 rounded-xl flex items-center justify-center mb-4">
              <UsersIcon class="h-6 w-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">Expert Connection</h3>
            <p class="text-gray-300">
              Easily connect with local agricultural professionals and extension workers for personalized guidance and
              technical support.
            </p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-[#c9d4a3] transition-all">
            <div class="w-12 h-12 bg-[#c9d4a3]/20 rounded-xl flex items-center justify-center mb-4">
              <MapPinIcon class="h-6 w-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold mb-2 text-white">Disease Monitoring Map</h3>
            <p class="text-gray-300">
              An interactive map to visualize reported cases and disease spread across Oriental Mindoro, helping farmers
              stay informed and proactive.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Knowledge Section -->
    <section id="knowledge" class="w-full min-h-screen bg-white flex items-center justify-center px-8 py-16">
      <div class="w-full max-w-screen-2xl">
        <!-- Section Header -->
        <div class="mb-16 space-y-4">
          <div class="inline-block">
            <div class="w-16 h-1 bg-[#606c38] mb-6 rounded-full"></div>
            <h2 class="text-4xl md:text-5xl font-bold text-[#283618] mb-4">
              Know the Threats to Your Crops
            </h2>
            <p class="text-lg md:text-lg text-gray-600 max-w-3xl leading-relaxed">
              Learn about the most common banana pests and diseases in the MIMAROPA Region—plus how to identify and prevent them.
            </p>
          </div>
        </div>
        <div class="grid lg:grid-cols-12 gap-8 min-h-[600px]">
          <!-- Left Sidebar -->
          <div class="lg:col-span-4 bg-[#283618] rounded-2xl shadow p-8 flex flex-col justify-between text-white">
            <div class="space-y-6">
              <h2 class="text-3xl md:text-4xl font-bold leading-tight">
                Detect Early. Act Smart. Protect Your <span class="italic">Bananas</span>.
              </h2>
              <p class="text-lg opacity-90">
                Learn about the most common banana pests and diseases in the MIMAROPA Region and how to identify them
                early.
              </p>
            </div>
            <button
              @click="navigateToSignup"
              class="w-full hover:bg-[#606c38]/60 bg-[#606c38] text-white font-semibold py-3 text-lg rounded-xl transition-all"
            >
              Get Started
            </button>
          </div>
 <!-- Right Content Area -->
          <div class="lg:col-span-8">
            <!-- Grid of Pests and Diseases -->
            <div class="grid md:grid-cols-2 gap-6">
              <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/1.svg" alt="Bacterial Soft Rot" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Bacterial Soft Rot</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Bacterial infection causing tissue collapse and foul-smelling decay.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/2.svg" alt="Aphids" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Aphids</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Small insects that suck sap and spread viruses to banana plants.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/3.svg" alt="Insect Pest" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Insect Pest (General)</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Various insects that chew or damage banana plant parts.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/4.svg" alt="Moko Disease" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Moko Disease</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Bacterial wilt causing internal damage and plant death.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/5.svg" alt="Black Sigatoka" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Black Sigatoka</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Severe fungal disease affecting banana leaves with black streaks.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/6.svg" alt="Yellow Sigatoka" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Yellow Sigatoka</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Mild leaf spot disease causing yellow to brown streaks.</p>
                </div>
              </div>
                            <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/7.svg" alt="Bract Mosaic Virus" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Bract Mosaic Virus</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Virus spread by aphids causing mosaic patterns on leaves.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/8.svg" alt="Panama Disease" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Panama Disease (Fusarium Wilt)</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Soil-borne fungal infection blocking water flow in plants.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/9.svg" alt="Pseudostem Weevil" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Pseudostem Weevil</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Borer insect damaging banana stems and weakening plants.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-[#c9d4a3] rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="/images/10.svg" alt="Fruit Scarring Beetle" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-[#283618] text-lg mb-1 leading-tight">Fruit Scarring Beetle</h4>
                  <p class="text-gray-600 text-sm leading-relaxed">Beetle causing surface scars and reduced fruit quality.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- <!-- About Us Section with Creative Vision & Mission -->
    <section id="about" class="w-full min-h-screen bg-white flex items-center justify-center px-8 py-16">
      <div class="w-full max-w-screen-2xl">
        <!-- Section Header -->
        <div class="text-center mb-16 space-y-4">
          <div class="inline-block">
            <div class="w-16 h-1 bg-[#606c38] mx-auto mb-6 rounded-full"></div>
            <h2 class="text-4xl md:text-5xl font-bold text-[#283618] mb-4">
              Behind the Vision of MUSALYTICS
            </h2>
            <p class="text-lg md:text-xl text-gray-700 max-w-5xl mx-auto leading-relaxed">
              Discover our mission, technology, and the passionate team working to protect banana farmers through AI-powered solutions.
            </p>
          </div>
        </div>

        <!--  Vision & Mission Section -->
        <div class="mb-20">
          <div class="relative max-w-6xl mx-auto">
            <!-- Simple connecting line -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-px bg-[#606c38] hidden lg:block"></div>
            
            <!-- Clean grid layout -->
            <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
              <!-- Vision Card - Minimalist Design -->
              <div 
                class="group cursor-pointer"
                @mouseenter="hoveredCard = 'vision'"
                @mouseleave="hoveredCard = null"
              >
                <div 
                  :class="[
                    'relative bg-white rounded-2xl p-8 border transition-all duration-300',
                    hoveredCard === 'vision' ? 'border-[#606c38] shadow-lg transform -translate-y-1' : 'border-gray-100 shadow-sm'
                  ]"
                >
                  <!-- Simple header -->
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-3 h-3 bg-[#606c38] rounded-full"></div>
                    <h3 class="text-2xl font-bold text-[#283618]">Vision</h3>
                  </div>
                  
                  <!-- Clean content -->
                  <div class="space-y-4">
                    <p class="text-gray-700 leading-relaxed">
                      A future where technology supports local farmers by preventing crop loss, promoting efficiency, and 
                      improving banana crop health in Oriental Mindoro and beyond.
                    </p>
                    
                    <!-- Simple tags -->
                    <div class="flex flex-wrap gap-2 pt-2">
                      <span class="px-3 py-1 bg-[#606c38]/10 text-[#283618] rounded-full text-sm">Technology</span>
                      <span class="px-3 py-1 bg-[#606c38]/10 text-[#283618] rounded-full text-sm">Prevention</span>
                      <span class="px-3 py-1 bg-[#606c38]/10 text-[#283618] rounded-full text-sm">Efficiency</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mission Card - Minimalist Design -->
              <div 
                class="group cursor-pointer"
                @mouseenter="hoveredCard = 'mission'"
                @mouseleave="hoveredCard = null"
              >
                <div 
                  :class="[
                    'relative bg-white rounded-2xl p-8 border transition-all duration-300',
                    hoveredCard === 'mission' ? 'border-[#c9d4a3] shadow-lg transform -translate-y-1' : 'border-gray-100 shadow-sm'
                  ]"
                >
                  <!-- Simple header -->
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-3 h-3 bg-[#c9d4a3] rounded-full"></div>
                    <h3 class="text-2xl font-bold text-[#283618]">Mission</h3>
                  </div>
                  
                  <!-- Clean content -->
                  <div class="space-y-4">
                    <p class="text-gray-700 leading-relaxed">
                      To empower banana farmers in the MIMAROPA Region with smart, AI-driven tools for early pest and disease 
                      detection, ensuring sustainable and productive agriculture.
                    </p>
                    
                    <!-- Simple tags -->
                    <div class="flex flex-wrap gap-2 pt-2">
                      <span class="px-3 py-1 bg-[#c9d4a3]/20 text-[#283618] rounded-full text-sm">AI-Driven</span>
                      <span class="px-3 py-1 bg-[#c9d4a3]/20 text-[#283618] rounded-full text-sm">Sustainable</span>
                      <span class="px-3 py-1 bg-[#c9d4a3]/20 text-[#283618] rounded-full text-sm">Empowerment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Partner Support Section (keeping original) -->
        <div class="mb-20">
          <div class="text-center mb-12">
            <h3 class="text-4xl font-bold text-[#283618] mb-4">Partner Support</h3>
            <p class="text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Our work would not be possible without the dedicated support of institutions and organizations committed to improving agricultural practices in the MIMAROPA Region.
            </p>
          </div>
          <!-- Government Partners with Creative Design -->
          <div class="mb-12">
            <h4 class="text-2xl font-semibold text-[#606c38] mb-8 text-center">Government & Agricultural Partners</h4>
            
            <!-- Creative Partner Cards -->
            <div class="grid md:grid-cols-3 gap-8 mb-8">
              <!-- DA Partner -->
              <div 
                class="relative group"
                @mouseenter="hoveredPartner = 'da'"
                @mouseleave="hoveredPartner = null"
              >
                <div 
                  :class="[
                    'relative bg-gradient-to-br from-[#283618] to-[#606c38] p-8 rounded-2xl transition-all duration-500 text-center overflow-hidden',
                    hoveredPartner === 'da' ? 'transform scale-105 shadow-2xl' : 'shadow-lg'
                  ]"
                >
                  <!-- Animated Background Pattern -->
                  <div class="absolute inset-0 opacity-10">
                    <div 
                      :class="[
                        'absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full transition-all duration-700',
                        hoveredPartner === 'da' ? 'scale-150 rotate-45' : 'scale-100'
                      ]"
                    ></div>
                    <div 
                      :class="[
                        'absolute -bottom-10 -left-10 w-24 h-24 bg-[#c9d4a3] rounded-full transition-all duration-700 delay-200',
                        hoveredPartner === 'da' ? 'scale-125 -rotate-45' : 'scale-100'
                      ]"
                    ></div>
                  </div>
                  
                  <div class="relative z-10">
                    <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <img src="/images/daLogo.svg" alt="Department of Agriculture Logo" class="w-full h-full object-contain" />
                    </div>
                    <h5 class="font-bold text-xl text-white mb-2">Department of Agriculture</h5>
                    <p class="text-[#c9d4a3] text-sm font-medium mb-4">DA MIMAROPA</p>
                    <p class="text-gray-200 text-sm">Agricultural research & policy support</p>
                  </div>
                </div>
              </div>
              <!-- RIARC Partner -->
              <div 
                class="relative group"
                @mouseenter="hoveredPartner = 'riarc'"
                @mouseleave="hoveredPartner = null"
              >
                <div 
                  :class="[
                    'relative bg-gradient-to-br from-[#606c38] to-[#c9d4a3] p-8 rounded-2xl transition-all duration-500 text-center overflow-hidden',
                    hoveredPartner === 'riarc' ? 'transform scale-105 shadow-2xl' : 'shadow-lg'
                  ]"
                >
                  <!-- Animated Background Pattern -->
                  <div class="absolute inset-0 opacity-10">
                    <div 
                      :class="[
                        'absolute -top-10 -left-10 w-28 h-28 bg-[#283618] rounded-full transition-all duration-700',
                        hoveredPartner === 'riarc' ? 'scale-150 rotate-90' : 'scale-100'
                      ]"
                    ></div>
                    <div 
                      :class="[
                        'absolute -bottom-10 -right-10 w-36 h-36 bg-white rounded-full transition-all duration-700 delay-300',
                        hoveredPartner === 'riarc' ? 'scale-125 -rotate-90' : 'scale-100'
                      ]"
                    ></div>
                  </div>
                  
                  <div class="relative z-10">
                    <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <img src="/images/rdLogo.svg" alt="RIARC Logo" class="w-full h-full object-contain" />
                    </div>
                    <h5 class="font-bold text-xl text-white mb-2">Regulatory Division</h5>
                    <p class="text-[#283618] text-sm font-medium mb-4">RD MIMAROPA</p>
                    <p class="text-gray-700 text-sm">Endorsing and Monitoring</p>
                  </div>
                </div>
              </div>
              <!-- RCPC Partner -->
              <div 
                class="relative group"
                @mouseenter="hoveredPartner = 'rcpc'"
                @mouseleave="hoveredPartner = null"
              >
                <div 
                  :class="[
                    'relative bg-gradient-to-br from-[#c9d4a3] to-[#283618] p-8 rounded-2xl transition-all duration-500 text-center overflow-hidden',
                    hoveredPartner === 'rcpc' ? 'transform scale-105 shadow-2xl' : 'shadow-lg'
                  ]"
                >
                  <!-- Animated Background Pattern -->
                  <div class="absolute inset-0 opacity-10">
                    <div 
                      :class="[
                        'absolute top-0 right-0 w-40 h-40 bg-[#606c38] rounded-full transition-all duration-700',
                        hoveredPartner === 'rcpc' ? 'scale-125 rotate-180' : 'scale-100'
                      ]"
                    ></div>
                    <div 
                      :class="[
                        'absolute -bottom-5 -left-5 w-20 h-20 bg-white rounded-full transition-all duration-700 delay-100',
                        hoveredPartner === 'rcpc' ? 'scale-150 rotate-180' : 'scale-100'
                      ]"
                    ></div>
                  </div>
                  
                  <div class="relative z-10">
                    <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <img src="/images/rcpcLogo.svg" alt="RCPC Logo" class="w-full h-full object-contain" />
                    </div>
                    <h5 class="font-bold text-xl text-white mb-2">DA Regional Crop Protection Center</h5>
                    <p class="text-[#c9d4a3] text-sm font-medium mb-4">RCPC MIMAROPA</p>
                    <p class="text-gray-200 text-sm">Pest & disease management expertise</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Partnership Impact Statement -->
            <div class="p-8">
              <div class="text-center">
                <div class="flex justify-center mb-4">
                  <div class="flex items-center gap-1">
                    <div class="w-2 h-2 bg-[#283618] rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-[#606c38] rounded-full animate-bounce delay-100"></div>
                    <div class="w-2 h-2 bg-[#c9d4a3] rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
                <p class="text-gray-700 italic leading-relaxed max-w-4xl mx-auto">
                  "These agencies helped us better understand the real challenges farmers face, ensuring that our system is rooted in local relevance and practical application."
                </p>
              </div>
            </div>
          </div>
          <!-- Academic Institution with Creative Design -->
          <div class="text-center">
            <h4 class="text-2xl font-semibold text-[#606c38] mb-8">Academic Institution</h4>
            <div 
              class="relative group max-w-2xl mx-auto"
              @mouseenter="hoveredPartner = 'minsu'"
              @mouseleave="hoveredPartner = null"
            >
              <div 
                :class="[
                  'relative bg-gradient-to-br from-[#283618] via-[#606c38] to-[#c9d4a3] p-10 rounded-3xl transition-all duration-700 text-center overflow-hidden',
                  hoveredPartner === 'minsu' ? 'transform scale-105 shadow-2xl' : 'shadow-xl'
                ]"
              >
                <!-- Animated Background Elements -->
                <div class="absolute inset-0 opacity-5">
                  <div 
                    :class="[
                      'absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full transition-all duration-1000',
                      hoveredPartner === 'minsu' ? 'scale-125 rotate-45' : 'scale-100'
                    ]"
                  ></div>
                  <div 
                    :class="[
                      'absolute -bottom-20 -left-20 w-40 h-40 bg-[#c9d4a3] rounded-full transition-all duration-1000 delay-300',
                      hoveredPartner === 'minsu' ? 'scale-150 -rotate-45' : 'scale-100'
                    ]"
                  ></div>
                  <div 
                    :class="[
                      'absolute top-10 left-10 w-32 h-32 bg-[#606c38] rounded-full transition-all duration-1000 delay-500',
                      hoveredPartner === 'minsu' ? 'scale-110 rotate-90' : 'scale-100'
                    ]"
                  ></div>
                </div>
                
                <div class="relative z-10">
                  <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <img src="/images/minsuLogo.svg" alt="Mindoro State University Logo" class="w-full h-full object-contain p-3" />
                  </div>
                  <h5 class="text-2xl font-bold text-white mb-6">Mindoro State University</h5>
                  <p class="text-gray-200 leading-relaxed">
                    We extend our heartfelt appreciation to Mindoro State University for their academic guidance and support. Their expertise and encouragement helped shape the foundation of our AI-driven solution and validated our approach to agricultural technology.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- REDESIGNED Developers Section -->
        <div>
          <div class="text-center mb-16">
            <h3 class="text-4xl font-bold text-[#283618] mb-6">Meet Our Development Team</h3>
            <p class="text-gray-700 max-w-4xl mx-auto leading-relaxed text-lg">
              The passionate minds behind MUSALYTICS — a dedicated team from Mindoro State University committed to revolutionizing agriculture through AI innovation.
            </p>
          </div>

          <!-- Hexagonal Developer Layout -->
          <div class="relative">
            <!-- Background Decorative Elements -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
              <div class="absolute top-10 left-10 w-32 h-32 bg-[#c9d4a3]/20 rounded-full blur-2xl animate-pulse"></div>
              <div class="absolute bottom-10 right-10 w-40 h-40 bg-[#606c38]/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[#283618]/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <!-- Developer Cards in Creative Layout -->
            <div class="grid lg:grid-cols-3 gap-12 relative z-10">
              <!-- Developer 1 - Project Leader -->
              <div 
                class="relative group"
                @mouseenter="hoveredDeveloper = 'rendel'"
                @mouseleave="hoveredDeveloper = null"
              >
                <div class="relative">
                  <!-- Floating Role Badge -->
                  <div 
                    :class="[
                      'absolute -top-6 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-gradient-to-r from-[#283618] to-[#606c38] text-white text-sm font-bold rounded-full shadow-lg transition-all duration-500',
                      hoveredDeveloper === 'rendel' ? 'scale-110 -rotate-3' : 'scale-100'
                    ]"
                  >
                    PROJECT LEADER
                  </div>

                  <!-- Main Card -->
                  <div 
                    :class="[
                      'relative bg-white rounded-3xl p-8 shadow-2xl border-2 transition-all duration-700 overflow-hidden',
                      hoveredDeveloper === 'rendel' ? 'border-[#283618] transform scale-105 shadow-3xl' : 'border-gray-200'
                    ]"
                  >
                    <!-- Animated Background -->
                    <div class="absolute inset-0 opacity-5">
                      <div 
                        :class="[
                          'absolute -top-20 -right-20 w-60 h-60 bg-[#283618] rounded-full transition-all duration-1000',
                          hoveredDeveloper === 'rendel' ? 'scale-125 rotate-45' : 'scale-100'
                        ]"
                      ></div>
                    </div>

                    <!-- Profile Section -->
                    <div class="relative z-10 text-center mb-6">
                      <div class="relative inline-block mb-6">
                        <div 
                          :class="[
                            'w-32 h-32 bg-gradient-to-br from-[#283618] to-[#606c38] rounded-full p-1 transition-all duration-500',
                            hoveredDeveloper === 'rendel' ? 'scale-110 rotate-6' : 'scale-100'
                          ]"
                        >
                          <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <img src="/images/pic1.svg" alt="Rendel Renz D. Aclan" class="w-full h-full object-contain rounded-full" />
                          </div>
                        </div>
                      </div>

                      <h4 class="text-2xl font-bold text-[#283618] mb-2">Rendel Renz D. Aclan</h4>
                      
                      <!-- Skill Tags -->
                      <div class="flex flex-wrap justify-center gap-2 mb-6">
                        <span class="px-3 py-1 bg-[#283618] text-white text-xs rounded-full">Backend</span>
                        <span class="px-3 py-1 bg-[#606c38] text-white text-xs rounded-full">Leadership</span>
                        <span class="px-3 py-1 bg-[#c9d4a3] text-[#283618] text-xs rounded-full">Architecture</span>
                      </div>
                    </div>

                    <!-- Quote Section -->
                    <div class="relative">
                      <div class="absolute -left-2 -top-2 text-4xl text-[#283618]/20 font-serif">"</div>
                      <div class="bg-gradient-to-r from-[#283618]/5 to-[#606c38]/5 rounded-xl p-6 border-l-4 border-[#283618]">
                        <p class="text-gray-700 text-sm leading-relaxed italic">
                          "As the project leader, I was responsible for leading the development of the backend system. I focused on building a strong system architecture and ensuring that all core functionalities worked smoothly and efficiently."
                        </p>
                      </div>
                      <div class="absolute -right-2 -bottom-2 text-4xl text-[#283618]/20 font-serif">"</div>
                    </div>

                    <!-- Decorative Elements -->
                    <div 
                      :class="[
                        'absolute bottom-4 right-4 transition-all duration-500',
                        hoveredDeveloper === 'rendel' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      ]"
                    >
                      <div class="w-16 h-16 bg-gradient-to-br from-[#283618] to-[#606c38] rounded-full opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Developer 2 - UI/UX Designer -->
              <div 
                class="relative group"
                @mouseenter="hoveredDeveloper = 'katherine'"
                @mouseleave="hoveredDeveloper = null"
              >
                <div class="relative">
                  <!-- Floating Role Badge -->
                  <div 
                    :class="[
                      'absolute -top-6 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-gradient-to-r from-[#606c38] to-[#c9d4a3] text-white text-sm font-bold rounded-full shadow-lg transition-all duration-500',
                      hoveredDeveloper === 'katherine' ? 'scale-110 rotate-3' : 'scale-100'
                    ]"
                  >
                    UI/UX DESIGNER
                  </div>

                  <!-- Main Card -->
                  <div 
                    :class="[
                      'relative bg-white rounded-3xl p-8 shadow-2xl border-2 transition-all duration-700 overflow-hidden',
                      hoveredDeveloper === 'katherine' ? 'border-[#606c38] transform scale-105 shadow-3xl' : 'border-gray-200'
                    ]"
                  >
                    <!-- Animated Background -->
                    <div class="absolute inset-0 opacity-5">
                      <div 
                        :class="[
                          'absolute -top-20 -left-20 w-60 h-60 bg-[#606c38] rounded-full transition-all duration-1000',
                          hoveredDeveloper === 'katherine' ? 'scale-125 -rotate-45' : 'scale-100'
                        ]"
                      ></div>
                    </div>

                    <!-- Profile Section -->
                    <div class="relative z-10 text-center mb-6">
                      <div class="relative inline-block mb-6">
                        <div 
                          :class="[
                            'w-32 h-32 bg-gradient-to-br from-[#606c38] to-[#c9d4a3] rounded-full p-1 transition-all duration-500',
                            hoveredDeveloper === 'katherine' ? 'scale-110 -rotate-6' : 'scale-100'
                          ]"
                        >
                          <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <img src="/images/pic2.svg" alt="Katherine B. De Leon" class="w-full h-full object-contain rounded-full" />
                          </div>
                        </div>
                      </div>

                      <h4 class="text-2xl font-bold text-[#283618] mb-2">Katherine B. De Leon</h4>
                      
                      <!-- Skill Tags -->
                      <div class="flex flex-wrap justify-center gap-2 mb-6">
                        <span class="px-3 py-1 bg-[#606c38] text-white text-xs rounded-full">UI/UX</span>
                        <span class="px-3 py-1 bg-[#c9d4a3] text-[#283618] text-xs rounded-full">Documentation</span>
                        <span class="px-3 py-1 bg-[#283618] text-white text-xs rounded-full">Design</span>
                      </div>
                    </div>

                    <!-- Quote Section -->
                    <div class="relative">
                      <div class="absolute -left-2 -top-2 text-4xl text-[#606c38]/20 font-serif">"</div>
                      <div class="bg-gradient-to-r from-[#606c38]/5 to-[#c9d4a3]/5 rounded-xl p-6 border-l-4 border-[#606c38]">
                        <p class="text-gray-700 text-sm leading-relaxed italic">
                          "I worked on designing the user interface and ensuring a seamless user experience. I also handled documentation to make sure everything about the project — from planning to execution — was properly recorded and presented."
                        </p>
                      </div>
                      <div class="absolute -right-2 -bottom-2 text-4xl text-[#606c38]/20 font-serif">"</div>
                    </div>

                    <!-- Decorative Elements -->
                    <div 
                      :class="[
                        'absolute bottom-4 right-4 transition-all duration-500',
                        hoveredDeveloper === 'katherine' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      ]"
                    >
                      <div class="w-16 h-16 bg-gradient-to-br from-[#606c38] to-[#c9d4a3] rounded-full opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Developer 3 - Programmer -->
              <div 
                class="relative group"
                @mouseenter="hoveredDeveloper = 'arnel'"
                @mouseleave="hoveredDeveloper = null"
              >
                <div class="relative">
                  <!-- Floating Role Badge -->
                  <div 
                    :class="[
                      'absolute -top-6 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-gradient-to-r from-[#c9d4a3] to-[#283618] text-white text-sm font-bold rounded-full shadow-lg transition-all duration-500',
                      hoveredDeveloper === 'arnel' ? 'scale-110 -rotate-3' : 'scale-100'
                    ]"
                  >
                    PROGRAMMER
                  </div>

                  <!-- Main Card -->
                  <div 
                    :class="[
                      'relative bg-white rounded-3xl p-8 shadow-2xl border-2 transition-all duration-700 overflow-hidden',
                      hoveredDeveloper === 'arnel' ? 'border-[#c9d4a3] transform scale-105 shadow-3xl' : 'border-gray-200'
                    ]"
                  >
                    <!-- Animated Background -->
                    <div class="absolute inset-0 opacity-5">
                      <div 
                        :class="[
                          'absolute -top-20 -right-20 w-60 h-60 bg-[#c9d4a3] rounded-full transition-all duration-1000',
                          hoveredDeveloper === 'arnel' ? 'scale-125 rotate-90' : 'scale-100'
                        ]"
                      ></div>
                    </div>

                    <!-- Profile Section -->
                    <div class="relative z-10 text-center mb-6">
                      <div class="relative inline-block mb-6">
                        <div 
                          :class="[
                            'w-32 h-32 bg-gradient-to-br from-[#c9d4a3] to-[#283618] rounded-full p-1 transition-all duration-500',
                            hoveredDeveloper === 'arnel' ? 'scale-110 rotate-6' : 'scale-100'
                          ]"
                        >
                          <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <img src="/images/pic3.svg" alt="Arnel A. Locquiao" class="w-full h-full object-contain rounded-full" />
                          </div>
                        </div>
                      </div>

                      <h4 class="text-2xl font-bold text-[#283618] mb-2">Arnel A. Locquiao</h4>
                      
                      <!-- Skill Tags -->
                      <div class="flex flex-wrap justify-center gap-2 mb-6">
                        <span class="px-3 py-1 bg-[#c9d4a3] text-[#283618] text-xs rounded-full">Programming</span>
                      </div>
                    </div>

                    <!-- Quote Section -->
                    <div class="relative">
                      <div class="absolute -left-2 -top-2 text-4xl text-[#c9d4a3]/40 font-serif">"</div>
                      <div class="bg-gradient-to-r from-[#c9d4a3]/5 to-[#283618]/5 rounded-xl p-6 border-l-4 border-[#c9d4a3]">
                        <p class="text-gray-700 text-sm leading-relaxed italic">
                          "I contributed to the system's development by writing code, testing features, and helping to improve the functionality. I collaborated with the team to ensure the system met the expected requirements."
                        </p>
                      </div>
                      <div class="absolute -right-2 -bottom-2 text-4xl text-[#c9d4a3]/40 font-serif">"</div>
                    </div>

                    <!-- Decorative Elements -->
                    <div 
                      :class="[
                        'absolute bottom-4 right-4 transition-all duration-500',
                        hoveredDeveloper === 'arnel' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      ]"
                    >
                      <div class="w-16 h-16 bg-gradient-to-br from-[#c9d4a3] to-[#283618] rounded-full opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- Call to Action -->
    <section class="w-full bg-white px-8 py-16">
      <div class="w-full max-w-7xl mx-auto">
        <div class="bg-white rounded-xl p-8 md:p-12 shadow">
          <div class="text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-4 text-black">Ready to protect your banana crops?</h2>
            <p class="text-lg mb-8 text-gray-700">
              Join farmers across Oriental Mindoro who are already using MUSALYTICS to improve crop health and yields.
            </p>
            <button
              class="hover:bg-[#606c38] bg-[#283618] text-white font-medium py-3 px-8 rounded-xl transition-all text-lg"
              @click="navigateToSignup"
            >
              Sign Up for Free
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="w-full border-t border-gray-300 bg-[#283618]">
      <div class="w-full px-8 py-8">
        <div class="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <img src="/images/musaLogowhite.svg" alt="Logo" class="h-9 w-9 object-contain" />
              <h2 class="text-2xl font-bold text-white">MUSALYTICS</h2>
            </div>
            <p class="text-gray-300 max-w-md text-base">
              CNN-Driven Detection System built to support banana farmers in the MIMAROPA Region by identifying common
              pests and diseases through image analysis.
            </p>
            <p class="text-gray-400 mt-4">© 2025 MUSALYTICS. All rights reserved.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <div class="grid grid-cols-2 gap-2">
              <a
                href="#hero"
                class="text-white hover:text-[#c9d4a3] flex items-center gap-1 transition-colors"
                @click="scrollToSection('hero', $event)"
              >
                <ChevronRightIcon class="h-4 w-4" /> Home
              </a>
              <a
                href="#features"
                class="text-white hover:text-[#c9d4a3] flex items-center gap-1 transition-colors"
                @click="scrollToSection('features', $event)"
              >
                <ChevronRightIcon class="h-4 w-4" /> Features
              </a>
              <a
                href="#knowledge"
                class="text-white hover:text-[#c9d4a3] flex items-center gap-1 transition-colors"
                @click="scrollToSection('knowledge', $event)"
              >
                <ChevronRightIcon class="h-4 w-4" /> Knowledge
              </a>
              <a
                href="#about"
                class="text-white hover:text-[#c9d4a3] flex items-center gap-1 transition-colors"
                @click="scrollToSection('about', $event)"
              >
                <ChevronRightIcon class="h-4 w-4" /> About Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Icons
import {
  LeafIcon,
  MenuIcon,
  XIcon,
  ScanIcon,
  FlaskRoundIcon,
  CalendarIcon,
  CloudIcon,
  UsersIcon,
  MapPinIcon,
  TargetIcon,
  EyeIcon,
  BrainIcon,
  ShieldIcon,
  GraduationCapIcon,
  UserIcon,
  ChevronRightIcon,
  CodeIcon
} from 'lucide-vue-next'

const mobileMenuOpen = ref(false)
const activeSection = ref('hero')
const hoveredCard = ref(null)
const hoveredPartner = ref(null)
const hoveredDeveloper = ref(null)
const router = useRouter()

// Navigation functions
const navigateToSignup = () => {
  router.push('/signup') // Adjust to your actual signup route
}


const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const scrollToSection = (sectionId, event = null) => {
  if (event) {
    event.preventDefault()
  }
  
  const element = document.getElementById(sectionId)
  if (element) {
    const headerOffset = 80
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
  
  mobileMenuOpen.value = false
}

// Handle scroll to update active section
const handleScroll = () => {
  const sections = ['hero', 'features', 'knowledge', 'about']
  const scrollPosition = window.scrollY + 100
  
  for (const section of sections) {
    const element = document.getElementById(section)
    if (element) {
      const { offsetTop, offsetHeight } = element
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        activeSection.value = section
        break
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}

/* Custom animations */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-slow-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

.animate-spin-slow-reverse {
  animation: spin-slow-reverse 15s linear infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite;
}

/* Custom scrollbar for knowledge section */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
