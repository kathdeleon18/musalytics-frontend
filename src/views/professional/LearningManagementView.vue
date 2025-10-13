<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, storage } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import ProfessionalNavbar from '../../components/professional/ProfessionalNavbar.vue';
import ProfessionalSidebar from '../../components/professional/ProfessionalSidebar.vue';
import SignOutConfirmation from '../../components/user/SignOutConfirmation.vue';
import CreateFolderModal from '../../components/professional/CreateFolderModal.vue';
import AddMaterialModal from '../../components/professional/AddMaterialModal.vue';
import NotificationToast from '../../components/professional/NotificationToast.vue';
import PageLoader from '../../components/professional/PageLoader.vue';
import { useDragAndDrop } from '../../composables/useDragAndDrop';
import { Eye, Edit, Move, Trash2, Download } from 'lucide-vue-next';

// Router
const router = useRouter();

// Current user state
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const photoURL = ref(null);
const userRole = ref('Professional');
const error = ref(null);
const showSignOutConfirmation = ref(false);

// View mode state
const viewMode = ref('grid'); // 'list' or 'grid'
const sortBy = ref('createdAt'); // Default sort by newest

// Folder navigation state
const currentFolderId = ref('root'); // 'root' is the top level
const currentFolderPath = ref([]); // Array of folder objects in the path
const folders = ref([]); // Folders in the current directory
const allFolders = ref([]); // All folders for move operations

// Folder modal state
const showCreateFolderModal = ref(false);
const editingFolder = ref(null);
const selectedFolder = ref(null);
const showDeleteFolderModal = ref(false);
const newFolder = ref({
  name: '',
  description: '',
  parentId: 'root'
});

// Move item modal state
const showMoveItemModal = ref(false);
const moveDestination = ref(null);

// Computed properties for current user
const userDisplayName = computed(() => {
  if (firstName.value && lastName.value) {
    return `${formatName(firstName.value)} ${formatName(lastName.value)}`;
  }
  return formatName(firstName.value) || 'Professional';
});

const userInitials = computed(() => {
  if (firstName.value && lastName.value) {
    return `${firstName.value.charAt(0)}${lastName.value.charAt(0)}`;
  }
  return firstName.value.charAt(0) || 'P';
});

// Learning materials state
const materials = ref([]);
const searchQuery = ref('');
const categoryFilter = ref('');
const fileTypeFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 12;
const showAddMaterialModal = ref(false);
const showEditMaterialModal = ref(false);
const showDeleteMaterialModal = ref(false);
const showPreviewModal = ref(false);
const selectedMaterial = ref(null);
const editingMaterial = ref(null);
const previewMaterialData = ref(null);
const newMaterial = ref({
  title: '',
  description: '',
  isPublic: true,
  folderId: 'root' // Default to root folder
});
const categoryInput = ref('');
const editCategoryInput = ref('');
const showCategorySuggestions = ref(false);
const showEditCategorySuggestions = ref(false);
const selectedFile = ref(null);
const selectedEditFile = ref(null);
const dragover = ref(false);
const replaceFile = ref(false);
const isDeleting = ref(false);
const isLoading = ref(true);

// File viewer state
const isFullscreen = ref(false);
const textContent = ref(null);
const viewerScale = ref(1);
const showControls = ref(true);

// DOM refs
const fileInput = ref(null);
const editFileInput = ref(null);

// Categories state - will now be dynamically populated from materials
const categories = ref([]);

// Notification state
const notification = ref({
  show: false,
  message: '',
  type: 'success', // 'success', 'error', 'warning'
  timeout: null
});

// Show notification
const showNotification = (message, type = 'success', duration = 5000) => {
  // Clear any existing timeout
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
  }
  
  // Set notification
  notification.value = {
    show: true,
    message,
    type,
    timeout: setTimeout(() => {
      hideNotification();
    }, duration)
  };
};

// Hide notification
const hideNotification = () => {
  notification.value.show = false;
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
    notification.value.timeout = null;
  }
};

// Multi-select state for materials
const selectedMaterials = ref([]);
const isMultiSelectMode = ref(false);
const showBulkMoveModal = ref(false);

// State for tracking folder creation
const isCreatingFolder = ref(false);

// Toggle multi-select mode
const toggleMultiSelectMode = () => {
  isMultiSelectMode.value = !isMultiSelectMode.value;
  if (!isMultiSelectMode.value) {
    selectedMaterials.value = [];
  }
};

// Toggle selection of a material
const toggleMaterialSelection = (material) => {
  const index = selectedMaterials.value.findIndex(m => m.id === material.id);
  if (index === -1) {
    selectedMaterials.value.push(material);
  } else {
    selectedMaterials.value.splice(index, 1);
  }
};

// Check if a material is selected
const isMaterialSelected = (material) => {
  return selectedMaterials.value.some(m => m.id === material.id);
};

// Select all materials in current view
const selectAllMaterials = () => {
  selectedMaterials.value = [...filteredMaterials.value];
};

// Deselect all materials
const deselectAllMaterials = () => {
  selectedMaterials.value = [];
};

// Show bulk move modal
const showBulkMoveModalFn = () => {
  if (selectedMaterials.value.length > 0) {
    moveDestination.value = null;
    showBulkMoveModal.value = true;
  } else {
    showNotification('Please select at least one material to move', 'warning');
  }
};

// Bulk move selected materials
const bulkMoveMaterials = async () => {
  if (!moveDestination.value) return;
  
  await moveSelectedToFolder(selectedMaterials.value, moveDestination.value);
  showBulkMoveModal.value = false;
  selectedMaterials.value = [];
  isMultiSelectMode.value = false;
};

// Use the drag and drop composable
const { 
  draggedItem, 
  dragOverFolderId, 
  startDrag, 
  dragOver, 
  dragLeave, 
  dropOnFolder,
  moveSelectedToFolder
} = useDragAndDrop(materials, showNotification);

// Computed properties for filtered and sorted items
const filteredFolders = computed(() => {
  if (!searchQuery.value) {
    return folders.value.filter(folder => folder.parentId === currentFolderId.value);
  }
  
  const search = searchQuery.value.toLowerCase();
  return folders.value.filter(folder => 
    folder.parentId === currentFolderId.value && 
    (folder.name.toLowerCase().includes(search) || 
     (folder.description && folder.description.toLowerCase().includes(search)))
  );
});

const filteredMaterials = computed(() => {
  // First filter by current folder
  let result = materials.value.filter(material => material.folderId === currentFolderId.value);
  
  // Then apply search and filters
  if (searchQuery.value || categoryFilter.value || fileTypeFilter.value) {
    const search = searchQuery.value.toLowerCase();
    
    result = result.filter(material => {
      // Search query filter
      const searchMatches = !search || 
        material.title.toLowerCase().includes(search) || 
        material.description.toLowerCase().includes(search) || 
        material.category.toLowerCase().includes(search);
      
      // Category filter
      const categoryMatches = !categoryFilter.value || material.category === categoryFilter.value;
      
      // File type filter
      const fileTypeMatches = !fileTypeFilter.value || material.fileType === fileTypeFilter.value;
      
      return searchMatches && categoryMatches && fileTypeMatches;
    });
  }
  
  // Apply sorting
  return sortItems(result);
});

// Filtered categories for suggestions
const filteredCategories = computed(() => {
  if (!categoryInput.value) return categories.value;
  
  const search = categoryInput.value.toLowerCase();
  return categories.value.filter(category => 
    category.toLowerCase().includes(search)
  );
});

const filteredEditCategories = computed(() => {
  if (!editCategoryInput.value) return categories.value;
  
  const search = editCategoryInput.value.toLowerCase();
  return categories.value.filter(category => 
    category.toLowerCase().includes(search)
  );
});

// Sort items based on the selected sort option
const sortItems = (items) => {
  switch (sortBy.value) {
    case 'createdAt':
      return [...items].sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA; // Newest first
      });
    case 'createdAtAsc':
      return [...items].sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateA - dateB; // Oldest first
      });
    case 'title':
      return [...items].sort((a, b) => a.title.localeCompare(b.title)); // A-Z
    case 'titleDesc':
      return [...items].sort((a, b) => b.title.localeCompare(a.title)); // Z-A
    case 'fileSize':
      return [...items].sort((a, b) => (a.fileSize || 0) - (b.fileSize || 0)); // Smallest first
    case 'fileSizeDesc':
      return [...items].sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0)); // Largest first
    default:
      return items;
  }
};

// Computed properties for pagination
const totalItems = computed(() => filteredFolders.value.length + filteredMaterials.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const paginatedFolders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  if (filteredFolders.value.length >= end) {
    return filteredFolders.value.slice(start, end);
  }

  if (start < filteredFolders.value.length) {
    return filteredFolders.value.slice(start);
  }

  return [];
});

const paginatedMaterials = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const foldersOnPage = paginatedFolders.value.length;

  if (foldersOnPage >= itemsPerPage) {
    return [];
  }

  const materialsStart = Math.max(0, start - filteredFolders.value.length);
  const materialsCount = itemsPerPage - foldersOnPage;

  return filteredMaterials.value.slice(materialsStart, materialsStart + materialsCount);
});

const paginationStart = computed(() => {
  return totalItems.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalItems.value);
});

// File type detection methods
const isPDF = (url) => {
  if (!url) return false;
  return url.toLowerCase().endsWith('.pdf');
};

const isTextFile = (fileName) => {
  if (!fileName) return false;
  const textExtensions = ['.txt', '.csv', '.json', '.xml', '.md', '.html', '.css', '.js', '.ts'];
  return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isOfficeDocument = (fileName) => {
  if (!fileName) return false;
  const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
  return officeExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Methods
const formatName = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';

  // If it's a Firestore timestamp, convert to JS Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const fetchCurrentUser = async () => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      error.value = "You must be logged in to view this page.";
      router.push('/signin');
      return;
    }
    
    // Get user data from Firestore
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("authUid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error("No user document found for current auth user");
      throw new Error("User profile not found. Please contact support.");
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Update user data state
    firstName.value = userData.firstName || '';
    lastName.value = userData.lastName || '';
    email.value = userData.email || '';
    photoURL.value = userData.photoURL || null;
    userRole.value = userData.role === 'professional' ? 'Professional' : 'User';
    
    // Check if user has correct role for this dashboard
    if (userData.role !== 'professional') {
      console.warn("User does not have professional role, redirecting to user dashboard");
      router.push('/user/dashboard');
      return;
    }
    
  } catch (err) {
    console.error("Error fetching current user data:", err);
    error.value = err.message || "Failed to load user data. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Firestore unsubscribe functions
let unsubscribeFolders = null;
let unsubscribeMaterials = null;

// Set up real-time listeners for folders and materials
const setupRealtimeListeners = () => {
  // Set up listener for folders
  const foldersRef = collection(db, "learningMaterials");
  const foldersQuery = query(foldersRef, where("type", "==", "folder"));
  
  unsubscribeFolders = onSnapshot(foldersQuery, (snapshot) => {
    const fetchedFolders = [];
    snapshot.forEach((doc) => {
      fetchedFolders.push({
        id: doc.id,
        ...doc.data(),
        // Add default values for any missing fields
        name: doc.data().name || 'Untitled Folder',
        description: doc.data().description || '',
        parentId: doc.data().parentId || 'root',
        createdAt: doc.data().createdAt || null,
        updatedAt: doc.data().updatedAt || null,
        createdBy: doc.data().createdBy || 'Unknown'
      });
    });
    
    folders.value = fetchedFolders;
    allFolders.value = fetchedFolders;
    console.log(`Real-time update: ${fetchedFolders.length} folders`);
    
    // Update folder path
    updateFolderPath();
  }, (error) => {
    console.error("Error in folders listener:", error);
    showNotification('Error loading folders: ' + error.message, 'error');
  });
  
  // Set up listener for materials
  const materialsRef = collection(db, "learningMaterials");
  const materialsQuery = query(materialsRef, where("type", "!=", "folder"));
  
  unsubscribeMaterials = onSnapshot(materialsQuery, (snapshot) => {
    const fetchedMaterials = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Skip folders
      if (data.type === "folder") return;
      
      fetchedMaterials.push({
        id: doc.id,
        ...data,
        // Add default values for any missing fields
        title: data.title || 'Untitled',
        description: data.description || '',
        category: data.category || 'other',
        fileType: data.fileType || 'other',
        fileSize: data.fileSize || 0,
        fileName: data.fileName || '',
        fileUrl: data.fileUrl || '',
        folderId: data.folderId || 'root', // Default to root folder
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        uploadedBy: data.uploadedBy || 'Unknown'
      });
    });
    
    materials.value = fetchedMaterials;
    console.log(`Real-time update: ${fetchedMaterials.length} learning materials`);
    
    // Extract unique categories from materials
    const uniqueCategories = [...new Set(fetchedMaterials.map(material => material.category))];
    
    // Reset categories and populate with unique categories from materials
    categories.value = uniqueCategories.filter(category => category !== 'other');
  }, (error) => {
    console.error("Error in materials listener:", error);
    showNotification('Error loading materials: ' + error.message, 'error');
  });
};

const updateFolderPath = async () => {
  if (currentFolderId.value === 'root') {
    currentFolderPath.value = [];
    return;
  }
  
  const path = [];
  let currentId = currentFolderId.value;
  
  // Build the path from current folder up to root
  while (currentId && currentId !== 'root') {
    const folder = folders.value.find(f => f.id === currentId);
    if (!folder) break;
    
    path.unshift(folder);
    currentId = folder.parentId;
  }
  
  currentFolderPath.value = path;
};

const navigateToFolder = (folderId) => {
  currentFolderId.value = folderId;
  currentPage.value = 1; // Reset pagination when changing folders
  updateFolderPath();
};

const navigateBack = () => {
  if (currentFolderId.value === 'root') return;
  const current = folders.value.find(f => f.id === currentFolderId.value);
  const parentId = current?.parentId || 'root';
  navigateToFolder(parentId);
};

const clearFilters = () => {
  searchQuery.value = '';
  categoryFilter.value = '';
  fileTypeFilter.value = '';
  currentPage.value = 1;
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const editFolder = (folder) => {
  editingFolder.value = folder;
  newFolder.value = {
    name: folder.name,
    description: folder.description || '',
    parentId: folder.parentId
  };
  showCreateFolderModal.value = true;
};

const saveFolder = async (folderData) => {
  try {
    isCreatingFolder.value = true;
    
    if (folderData.id) {
      // Update existing folder
      await updateDoc(doc(db, "learningMaterials", folderData.id), {
        name: folderData.name,
        description: folderData.description,
        updatedAt: serverTimestamp()
      });
      
      showNotification('Folder updated successfully', 'success');
    } else {
      // Create new folder
      const folderToAdd = {
        name: folderData.name,
        description: folderData.description,
        parentId: currentFolderId.value, // Create in current folder
        type: "folder", // Mark as folder
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userDisplayName.value
      };
      
      await addDoc(collection(db, "learningMaterials"), folderToAdd);
      
      showNotification('Folder created successfully', 'success');
    }
    
    // Reset form and close modal
    newFolder.value = {
      name: '',
      description: '',
      parentId: 'root'
    };
    editingFolder.value = null;
    showCreateFolderModal.value = false;
    
    // Add a small delay to ensure Firestore has processed the new folder
    setTimeout(() => {
      isCreatingFolder.value = false;
    }, 1000); // 1 second delay
    
  } catch (err) {
    console.error("Error saving folder:", err);
    showNotification('Error saving folder: ' + err.message, 'error');
    isCreatingFolder.value = false;
  }
};

const confirmDeleteFolder = (folder) => {
  selectedFolder.value = folder;
  showDeleteFolderModal.value = true;
};

const confirmDeleteMaterial = (material) => {
  selectedMaterial.value = material;
  showDeleteMaterialModal.value = true;
};

const deleteFolder = async () => {
  if (!selectedFolder.value) return;
  
  isDeleting.value = true;
  
  try {
    // Check if folder has materials
    const materialsInFolder = materials.value.filter(m => m.folderId === selectedFolder.value.id);
    
    // Delete all materials in the folder
    for (const material of materialsInFolder) {
      // Delete file from storage
      if (material.storagePath) {
        const fileRef = storageRef(storage, material.storagePath);
        await deleteObject(fileRef);
      }
      
      // Delete document from Firestore
      await deleteDoc(doc(db, "learningMaterials", material.id));
    }
    
    // Check if folder has subfolders
    const subfolders = folders.value.filter(f => f.parentId === selectedFolder.value.id);
    
    // Recursively delete subfolders
    for (const subfolder of subfolders) {
      // Set as selected folder and delete
      const tempSelected = selectedFolder.value;
      selectedFolder.value = subfolder;
      await deleteFolder();
      selectedFolder.value = tempSelected;
    }
    
    // Delete the folder itself
    await deleteDoc(doc(db, "learningMaterials", selectedFolder.value.id));
    
    showNotification('Folder and its contents deleted successfully', 'success');
    showDeleteFolderModal.value = false;
    selectedFolder.value = null;
    
  } catch (err) {
    console.error("Error deleting folder:", err);
    showNotification('Error deleting folder: ' + err.message, 'error');
  } finally {
    isDeleting.value = false;
  }
};

const deleteMaterial = async () => {
  if (!selectedMaterial.value) return;
  
  isDeleting.value = true;
  
  try {
    // Delete file from storage
    if (selectedMaterial.value.storagePath) {
      const fileRef = storageRef(storage, selectedMaterial.value.storagePath);
      await deleteObject(fileRef);
    }
    
    // Delete document from Firestore
    await deleteDoc(doc(db, "learningMaterials", selectedMaterial.value.id));
    
    showNotification('Material deleted successfully', 'success');
    showDeleteMaterialModal.value = false;
    selectedMaterial.value = null;
    
  } catch (err) {
    console.error("Error deleting material:", err);
    showNotification('Error deleting material: ' + err.message, 'error');
  } finally {
    isDeleting.value = false;
  }
};

// Move item operation
const moveItem = async () => {
  if (!selectedMaterial.value || !moveDestination.value) return;
  
  try {
    // Update in Firestore
    await updateDoc(doc(db, "learningMaterials", selectedMaterial.value.id), {
      folderId: moveDestination.value,
      updatedAt: serverTimestamp()
    });
    
    showNotification('Item moved successfully', 'success');
    showMoveItemModal.value = false;
    selectedMaterial.value = null;
    moveDestination.value = null;
    
  } catch (err) {
    console.error("Error moving item:", err);
    showNotification('Error moving item: ' + err.message, 'error');
  }
};

// Edit material
const editMaterial = (material) => {
  editingMaterial.value = { ...material };
  editCategoryInput.value = material.category;
  replaceFile.value = false;
  selectedEditFile.value = null;
  showEditMaterialModal.value = true;
};

// Preview material
const previewMaterial = async (material) => {
  previewMaterialData.value = material;
  textContent.value = null; // Reset text content
  isLoading.value = true;
  viewerScale.value = 1; // Reset zoom level
  
  try {
    // If it's a text file, fetch the content
    if (material.fileType === 'document' && isTextFile(material.fileName)) {
      try {
        const response = await fetch(material.fileUrl);
        if (response.ok) {
          textContent.value = await response.text();
        } else {
          showNotification('Failed to load text content', 'error');
        }
      } catch (error) {
        console.error('Error loading text content:', error);
        showNotification('Error loading text content', 'error');
      }
    }
    
    showPreviewModal.value = true;
    
    // Allow time for the modal to render before hiding loading state
    await nextTick();
    
    // For PDFs and Office documents, we'll let the iframe load event handle the loading state
    // For other types, we'll hide the loading state after a short delay
    if (!(material.fileType === 'document' && (isPDF(material.fileUrl) || isOfficeDocument(material.fileName)))) {
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    }
  } catch (err) {
    console.error("Error previewing material:", err);
    showNotification('Error previewing material: ' + err.message, 'error');
    isLoading.value = false;
  }
};

// Viewer controls
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  
  // When entering fullscreen, show controls briefly
  if (isFullscreen.value) {
    showControls.value = true;
    setTimeout(() => {
      showControls.value = false;
    }, 3000);
  }
};

const zoomIn = () => {
  viewerScale.value = Math.min(viewerScale.value + 0.1, 2);
};

const zoomOut = () => {
  viewerScale.value = Math.max(viewerScale.value - 0.1, 0.5);
};

const resetZoom = () => {
  viewerScale.value = 1;
};

// Handle mouse leave for controls
const handleMouseLeave = () => {
  if (!isFullscreen.value) {
    window.setTimeout(() => {
      showControls.value = false;
    }, 2000);
  }
};

// Error handling for media
const handleImageError = (event) => {
  event.target.src = '/placeholder.svg?height=200&width=300';
};

const handlePreviewImageError = (event) => {
  event.target.src = '/placeholder.svg?height=400&width=600';
};

const handlePreviewVideoError = (event) => {
  console.error('Video preview error:', event);
  showNotification('Error loading video content', 'error');
};

const handlePreviewAudioError = (event) => {
  console.error('Audio preview error:', event);
  showNotification('Error loading audio content', 'error');
};

// Desktop-like interactions/helpers
const getFileExtension = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return '';
  const idx = fileName.lastIndexOf('.');
  return idx !== -1 ? fileName.slice(idx + 1).toLowerCase() : '';
};

const openFolder = (folder) => {
  if (!folder || !folder.id) return;
  navigateToFolder(folder.id);
};

const openMaterial = (material) => {
  if (!material) return;
  previewMaterial(material);
};

// Three-dot context menu state and handlers
const openMenuItemId = ref(null); // 'folder-<id>' | 'material-<id>' | null
const toggleItemMenu = (type, id, event) => {
  event?.stopPropagation();
  const key = `${type}-${id}`;
  openMenuItemId.value = openMenuItemId.value === key ? null : key;
};
const closeItemMenu = () => { openMenuItemId.value = null; };
const handleGlobalClick = (e) => {
  // close any open menu when clicking anywhere
  if (openMenuItemId.value) {
    openMenuItemId.value = null;
  }
};

// Direct download to avoid opening new tab
const downloadMaterial = async (material) => {
  try {
    if (!material?.fileUrl || !material?.fileName) {
      showNotification('File not available for download', 'error');
      return;
    }
    const link = document.createElement('a');
    link.href = material.fileUrl;
    link.download = material.fileName;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    closeItemMenu();
  } catch (err) {
    console.error('Download error:', err);
    showNotification('Failed to start download', 'error');
  }
};

// Save edited material
const saveEditedMaterial = async () => {
  if (!editingMaterial.value) return;
  try {
    isLoading.value = true;
    // If replacing file, upload and update URL, name, size, storagePath
    if (replaceFile.value && selectedEditFile.value) {
      const file = selectedEditFile.value;
      const storagePath = `learning-materials/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, storagePath);
      const uploadTask = uploadBytesResumable(sRef, file);
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            editingMaterial.value.fileUrl = url;
            editingMaterial.value.fileName = file.name;
            editingMaterial.value.fileSize = file.size;
            editingMaterial.value.storagePath = storagePath;
            resolve();
          } catch (e) { reject(e); }
        });
      });
    }
    // Category update from input if provided
    if (editCategoryInput.value) {
      editingMaterial.value.category = editCategoryInput.value;
    }
    await updateDoc(doc(db, 'learningMaterials', editingMaterial.value.id), {
      title: editingMaterial.value.title,
      description: editingMaterial.value.description,
      category: editingMaterial.value.category,
      isPublic: editingMaterial.value.isPublic,
      fileUrl: editingMaterial.value.fileUrl,
      fileName: editingMaterial.value.fileName,
      fileSize: editingMaterial.value.fileSize,
      storagePath: editingMaterial.value.storagePath,
      updatedAt: serverTimestamp()
    });
    showNotification('Material updated successfully', 'success');
    showEditMaterialModal.value = false;
    replaceFile.value = false;
    selectedEditFile.value = null;
    editingMaterial.value = null;
  } catch (err) {
    console.error('Error updating material:', err);
    showNotification('Error updating material: ' + err.message, 'error');
  } finally {
    isLoading.value = false;
  }
};

const onEditFileChange = (e) => {
  const files = e?.target?.files || [];
  if (files.length > 0) {
    selectedEditFile.value = files[0];
  }
};

// Rename (for documents/materials)
const renameMaterial = async (material) => {
  if (!material) return;
  try {
    const currentBase = (material.title || material.fileName || '').replace(/\.[^/.]+$/, '');
    const input = window.prompt('Rename document', currentBase);
    if (input === null) return; // cancelled
    const newBase = input.trim();
    if (!newBase) {
      showNotification('Name cannot be empty', 'warning');
      return;
    }
    const ext = material.fileName ? material.fileName.slice(material.fileName.lastIndexOf('.') + 1) : '';
    const newFileName = ext ? `${newBase}.${ext}` : newBase;
    await updateDoc(doc(db, 'learningMaterials', material.id), {
      title: newBase,
      fileName: newFileName,
      updatedAt: serverTimestamp()
    });
    showNotification('Document renamed', 'success');
  } catch (err) {
    console.error('Rename error:', err);
    showNotification('Failed to rename document: ' + err.message, 'error');
  } finally {
    closeItemMenu();
  }
};

// Handle material added from AddMaterialModal
const handleMaterialAdded = (materialData) => {
  // With real-time listeners, we don't need to manually update the local state
  // The listener will automatically update the materials array
  showNotification('Material added successfully', 'success');
  showAddMaterialModal.value = false; // Close the modal after successful addition
};

// Add category
const addCategory = (category) => {
  if (!categories.value.includes(category)) {
    categories.value.push(category);
  }
};

// Function to navigate to profile page
const goToProfile = () => {
  router.push('/professional/profile');
};

// Handle sign out
const handleSignOut = async () => {
  try {
    await signOut(auth);
    router.push('/signin');
  } catch (err) {
    console.error("Error signing out:", err);
    showNotification('Error signing out: ' + err.message, 'error');
  }
};

// Watch for changes in currentFolderId to update the folder path
watch(currentFolderId, () => {
  updateFolderPath();
});

// Clean up listeners when component is unmounted
onUnmounted(() => {
  if (unsubscribeFolders) {
    unsubscribeFolders();
  }
  if (unsubscribeMaterials) {
    unsubscribeMaterials();
  }
  window.removeEventListener('click', handleGlobalClick);
});

// onMounted hook
onMounted(() => {
  fetchCurrentUser();
  // Instead of the old fetch methods, use real-time listeners
  setupRealtimeListeners();
  // Close any open item menus when clicking outside
  window.addEventListener('click', handleGlobalClick);
});
</script>

<template>
  <div class="min-h-screen bg-[#f8f8f8] text-gray-900 pt-16">
    <!-- Success Notification -->
    <NotificationToast
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="hideNotification"
    />
    
    <!-- Top Navigation Bar -->
    <ProfessionalNavbar 
      :user-initials="userInitials"
      :user-display-name="userDisplayName"
      :email="email"
      :notification-count="notificationCount"
      :photoURL="photoURL"
      @manage-profile="goToProfile"
      @sign-out="showSignOutConfirmation = true"
    />
    
    <!-- Main Content -->
    <div class="pt-8 md:pl-64 flex">
      <!-- Sidebar -->
      <ProfessionalSidebar />
      
      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-auto">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 class="text-3xl font-semibold mb-1 text-[#283618]">Learning Management</h1>
            <p class="text-sm sm:text-base text-gray-400">Upload and manage educational materials for farmers</p>
          </div>
          
          <div class="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button 
              @click="showCreateFolderModal = true"
              class="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-400 rounded-xl text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h5a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
              New Folder
            </button>
            
            <button 
              @click="showAddMaterialModal = true"
              class="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-400 rounded-xl text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Material
            </button>
            
            <button 
              @click="toggleMultiSelectMode"
              class="flex items-center justify-center px-4 py-2 rounded-xl text-white transition-colors"
              :class="isMultiSelectMode ? 'bg-red-600 hover:bg-red-400' : 'bg-gray-600 hover:bg-gray-400'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {{ isMultiSelectMode ? 'Cancel Selection' : 'Select Multiple' }}
            </button>
          </div>
        </div>
        
        <!-- Multi-select Actions Bar (only shown when in multi-select mode) -->
        <div v-if="isMultiSelectMode" class="bg-transparent rounded-xl  p-3 mb-4 flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-gray-500 font-medium">{{ selectedMaterials.length }} items selected</span>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="selectAllMaterials"
              class="px-3 py-1.5 text-black-700 hover:text-gray-500 transition-colors text-sm"
            >
              Select All
            </button>
            <button 
              @click="deselectAllMaterials"
              class="px-3 py-1.5 text-gray-700 hover:text-gray-400 transition-colors text-sm"
              :disabled="selectedMaterials.length === 0"
              :class="{ 'opacity-50 cursor-not-allowed': selectedMaterials.length === 0 }"
            >
              Deselect All
            </button>
            <button 
              @click="showBulkMoveModalFn"
              class="px-3 py-1.5 text-gray-700 hover:text-gray-400 rounded-md transition-colors text-sm"
              :disabled="selectedMaterials.length === 0"
              :class="{ 'opacity-50 cursor-not-allowed': selectedMaterials.length === 0 }"
            >
              Move Selected
            </button>
          </div>
        </div>
        
        <!-- Folder Navigation Breadcrumbs + Back -->
        <div class="rounded-lg p-3 mb-4 flex items-center gap-2 overflow-x-auto">
          <button 
            class="px-3 py-1.5 text-base text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="currentFolderId === 'root'"
            @click="navigateBack"
            title="Back"
          >
            ← Back
          </button>

          <button 
            @click="navigateToFolder('root')" 
            class="flex items-center text-gray-600 hover:text-gray-800 px-2 py-1 rounded transition-colors"
            :class="{ 'font-medium': currentFolderId === 'root' }"
            title="Go to Root"
          >
            Root
          </button>
          <span v-if="currentFolderPath.length > 0" class="mx-1 text-gray-500">/</span>
          <span v-if="currentFolderPath.length > 0" class="mx-1 text-gray-500">/</span>
          
          <template v-for="(folder, index) in currentFolderPath" :key="folder.id">
            <button 
              @click="navigateToFolder(folder.id)" 
              class="flex items-center text-gray-400 hover:text-gray-300 px-2 py-1 rounded transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {{ folder.name }}
            </button>
            <span v-if="index < currentFolderPath.length - 1" class="mx-1 text-gray-500">/</span>
          </template>
        </div>
        
        <!-- Filters and Search -->
        <div class="bg-white rounded-xl p-4 mb-6 shadow-lg">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <!-- Search -->
            <div class="relative flex-1">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search materials by title, description, or category..." 
                class="w-full px-4 py-2 pr-10 bg-white border border-gray-300 rounded-xl text-[#283618] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <!-- Filters and View Toggle -->
            <div class="flex flex-wrap gap-3 items-center">
              <!-- Category Filter -->
              <div class="relative">
                <select 
                  v-model="categoryFilter"
                  class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                >
                  <option value="">All Categories</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ formatName(category) }}
                  </option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-2 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              <!-- File Type Filter -->
              <div class="relative">
                <select 
                  v-model="fileTypeFilter"
                  class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                >
                  <option value="">All File Types</option>
                  <option value="document">Documents</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="other">Other</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-2 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              <!-- Sort By -->
              <div class="relative">
                <select 
                  v-model="sortBy"
                  class="w-full bg-white border border-gray-300 rounded-xl py-2 pl-4 pr-8 text-gray-500 appearance-none transition-all duration-200 text-sm"
                >
                  <option value="createdAt">Date (Newest)</option>
                  <option value="createdAtAsc">Date (Oldest)</option>
                  <option value="title">Name (A-Z)</option>
                  <option value="titleDesc">Name (Z-A)</option>
                  <option value="fileSize">Size (Smallest)</option>
                  <option value="fileSizeDesc">Size (Largest)</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-2 top-2.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              <!-- View Toggle -->
              <div class="flex bg-gray-300 overflow-hidden">
                <button 
                  @click="viewMode = 'list'"
                  :class="{ 'bg-[#606c38] text-white': viewMode === 'list' }"
                  class="px-3 py-2 flex items-center justify-center transition-colors"
                  title="List View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button 
                  @click="viewMode = 'grid'"
                  :class="{ 'bg-[#606c38] text-white': viewMode === 'grid' }"
                  class="px-3 py-2 flex items-center justify-center transition-colors"
                  title="Grid View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
              
              <!-- Clear Filters -->
              <button 
                @click="clearFilters"
                class="px-4 py-2 bg-transparent transition-colors text-sm text-red-500 hover:text-red-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        <!-- Files Container -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- No Materials or Folders Found Message -->
          <div v-if="filteredFolders.length === 0 && filteredMaterials.length === 0" class="p-12 text-center">
            <div class="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h5a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
              <p class="text-lg font-medium mb-1 text-black">No folders or materials found</p>
              <p class="text-gray-400 text-sm">Try adjusting your search or filters, or add new folders and materials</p>
              <div class="flex flex-wrap gap-3 mt-6">
                <button 
                  @click="showCreateFolderModal = true"
                  class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-400 rounded-xl transition-colors"
                >
                  Create Folder
                </button>
                <button 
                  @click="showAddMaterialModal = true"
                  class="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-400 rounded-xl transition-colors"
                >
                  Add Material
                </button>
              </div>
            </div>
          </div>
          
          <!-- List View -->
          <div v-else-if="viewMode === 'list'">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-[#283618] border-b border-gray-700/50  text-left">
                    <th v-if="isMultiSelectMode" class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider w-10">
                      <input 
                        type="checkbox" 
                        :checked="selectedMaterials.length > 0 && selectedMaterials.length === filteredMaterials.length"
                        :indeterminate="selectedMaterials.length > 0 && selectedMaterials.length < filteredMaterials.length"
                        @change="selectedMaterials.length === filteredMaterials.length ? deselectAllMaterials() : selectAllMaterials()"
                        class="h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700"
                      />
                    </th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Size</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Modified</th>
                    <th class="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300">
                  <!-- Folders -->
                  <tr 
                    v-for="folder in paginatedFolders" 
                    :key="'folder-' + folder.id" 
                    class="bg-white hover:bg-[#f7f2df] transition-colors cursor-pointer"
                    :class="{ 'border-2 border-indigo-500': dragOverFolderId === folder.id }"
                    @dragover.prevent="dragOver(folder.id, $event)"
                    @dragleave.prevent="dragLeave"
                    @drop.prevent="dropOnFolder(folder.id, $event)"
                    @dblclick="openFolder(folder)"
                  >
                    <td v-if="isMultiSelectMode" class="px-6 py-4 w-10">
                      <!-- Folders can't be selected -->
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="mr-3">
                          <div class="os-folder-icon small"></div>
                        </div>
                        <div>
                          <button 
                            @click="navigateToFolder(folder.id)" 
                            class="font-medium text-[#606c38]"
                          >
                            {{ folder.name }}
                          </button>
                          <div class="text-sm text-gray-500 truncate max-w-xs">{{ folder.description || 'No description' }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                        Folder
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-gray-400">-</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span class="text-gray-400">-</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(folder.updatedAt || folder.createdAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div class="flex space-x-2">
                        <button 
                          @click="editFolder(folder)"
                          class="p-1.5 text-yellow-500 hover:text-yellow-300 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          @click="confirmDeleteFolder(folder)"
                          class="p-1.5 text-red-500 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Materials -->
                  <tr 
                    v-for="material in paginatedMaterials" 
                    :key="'material-' + material.id" 
                    class="bg-white hover:bg-[#f7f2df] transition-colors cursor-pointer"
                    :class="{ 'bg-indigo-900/30': isMaterialSelected(material) }"
                    draggable="true"
                    @dragstart="startDrag(material)"
                    @dblclick="openMaterial(material)"
                  >
                    <td v-if="isMultiSelectMode" class="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        :checked="isMaterialSelected(material)"
                        @change="toggleMaterialSelection(material)"
                        class="h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="mr-3">
                          <div class="os-file-icon small">
                            <span class="ext">{{ getFileExtension(material.fileName) }}</span>
                          </div>
                        </div>
                        <div>
                          <div class="font-medium text-[#606c38]">{{ material.title }}</div>
                          <div class="text-sm text-gray-500 truncate max-w-xs">{{ material.description }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        :class="{
                          'bg-purple-500/20 text-purple-400': material.fileType === 'document',
                          'bg-green-500/20 text-green-400': material.fileType === 'image',
                          'bg-red-500/20 text-red-400': material.fileType === 'video',
                          'bg-yellow-500/20 text-yellow-400': material.fileType === 'audio',
                          'bg-gray-500/20 text-gray-400': material.fileType === 'other'
                        }"
                        class="px-2 py-1 text-xs rounded-full"
                      >
                        {{ formatName(material.fileType) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                        {{ formatName(material.category) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatFileSize(material.fileSize) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(material.updatedAt || material.createdAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div class="flex space-x-2">
                        <button 
                          @click="previewMaterial(material)"
                          class="p-1.5 text-blue-500 hover:text-blue-300 transition-colors"
                          title="Preview"
                        >
                          <Eye class="h-4 w-4" />
                        </button>
                        <button 
                          @click="renameMaterial(material)"
                          class="p-1.5 text-yellow-500 hover:text-yellow-300 transition-colors"
                          title="Rename"
                        >
                          <Edit class="h-4 w-4" />
                        </button>
                        <button 
                          @click="showMoveItemModal = true; selectedMaterial = material"
                          class="p-1.5 text-indigo-500 hover:text-indigo-300 transition-colors"
                          title="Move"
                        >
                          <Move class="h-4 w-4" />
                        </button>
                        <button 
                          @click="confirmDeleteMaterial(material)"
                          class="p-1.5 text-red-500 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 class="h-4 w-4" />
                        </button>
                        <button 
                          @click="downloadMaterial(material)"
                          class="p-1.5 text-emerald-500 hover:text-emerald-300 transition-colors"
                          title="Download"
                        >
                          <Download class="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Pagination for List View -->
            <div class="bg-[#f7f2df] px-6 py-4 flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalItems }} items
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                  class="px-3 py-1 text-gray-500 rounded-md hover:text-[#606c38] transition-colors"
                >
                  Previous
                </button>
                <button 
                  @click="nextPage" 
                  :disabled="currentPage === totalPages"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
                  class="px-3 py-1 text-gray-500 rounded-md hover:text-[#606c38] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          
          <!-- Grid View -->
          <div v-else class="p-6">
            <!-- Grid of desktop-like icon tiles -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              <!-- Folders -->
              <div 
                v-for="folder in paginatedFolders" 
                :key="'folder-' + folder.id" 
                class="os-tile cursor-pointer select-none"
                :class="{ 'ring-2 ring-indigo-500': dragOverFolderId === folder.id }"
                @dragover.prevent="dragOver(folder.id, $event)"
                @dragleave.prevent="dragLeave"
                @drop.prevent="dropOnFolder(folder.id, $event)"
                @dblclick="openFolder(folder)"
              >
                <div class="icon-wrapper">
                  <div class="os-folder-icon large"></div>
                </div>
                <div class="label" :title="folder.name">
                  {{ folder.name }}
                </div>
                <div class="menu-wrapper" @click.stop>
                  <button 
                    class="menu-btn"
                    title="More"
                    @click="toggleItemMenu('folder', folder.id, $event)"
                  >
                    ⋮
                  </button>
                  <div 
                    v-if="openMenuItemId === 'folder-' + folder.id" 
                    class="menu-dropdown"
                  >
                    <button class="menu-item" @click="editFolder(folder); closeItemMenu()">Edit</button>
                    <button class="menu-item danger" @click="confirmDeleteFolder(folder); closeItemMenu()">Delete</button>
                  </div>
                </div>
              </div>
              
              <!-- Materials -->
              <div 
                v-for="material in paginatedMaterials" 
                :key="'material-' + material.id" 
                class="os-tile cursor-pointer select-none"
                :class="{ 'ring-2 ring-indigo-500': isMultiSelectMode && isMaterialSelected(material) }"
                draggable="true"
                @dragstart="startDrag(material)"
                @dblclick="openMaterial(material)"
              >
                <!-- Checkbox for multi-select (only shown in multi-select mode) -->
                <div v-if="isMultiSelectMode" class="absolute top-2 left-2 z-10">
                  <input 
                    type="checkbox" 
                    :checked="isMaterialSelected(material)"
                    @change="toggleMaterialSelection(material)"
                    class="h-5 w-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700/70"
                  />
                </div>
                <div class="icon-wrapper">
                  <template v-if="material.fileType === 'image'">
                    <img 
                      :src="material.fileUrl" 
                      :alt="material.title" 
                      class="w-full h-full object-cover rounded-md"
                      @error="handleImageError"
                    />
                  </template>
                  <template v-else>
                    <div class="os-file-icon large"
                         :class="{
                           'document': material.fileType === 'document',
                           'image': material.fileType === 'image',
                           'video': material.fileType === 'video',
                           'audio': material.fileType === 'audio'
                         }">
                      <span class="ext">{{ getFileExtension(material.fileName) }}</span>
                    </div>
                  </template>
                </div>
                <div class="label" :title="material.title">
                  {{ material.title }}
                </div>
                <div class="menu-wrapper" @click.stop>
                  <button 
                    class="menu-btn"
                    title="More"
                    @click="toggleItemMenu('material', material.id, $event)"
                  >
                    ⋮
                  </button>
                  <div 
                    v-if="openMenuItemId === 'material-' + material.id" 
                    class="menu-dropdown"
                  >
                    <button class="menu-item" @click="renameMaterial(material)">Rename</button>
                    <button class="menu-item" @click="showMoveItemModal = true; selectedMaterial = material; closeItemMenu()">Move</button>
                    <button class="menu-item" @click="downloadMaterial(material)">Download</button>
                    <button class="menu-item danger" @click="confirmDeleteMaterial(material); closeItemMenu()">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Pagination for Grid View -->
            <div class="mt-6 flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalItems }} items
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                  class="px-3 py-1 text-gray-400 rounded-md hover:text-[#606c38] transition-colors"
                >
                  Previous
                </button>
                <button 
                  @click="nextPage" 
                  :disabled="currentPage === totalPages"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
                  class="px-3 py-1 text-gray-400 rounded-md hover:text-[#606c38] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Create Folder Modal -->
    <CreateFolderModal
      v-if="showCreateFolderModal"
      :show="showCreateFolderModal"
      :editing-folder="editingFolder"
      :current-folder-id="currentFolderId"
      @close="showCreateFolderModal = false; editingFolder = null"
      @save="saveFolder"
    />
    
    <!-- Add Material Modal -->
    <AddMaterialModal
      v-if="showAddMaterialModal"
      :show="showAddMaterialModal"
      :current-folder-id="currentFolderId"
      :categories="categories"
      :user-display-name="userDisplayName"
      @close="showAddMaterialModal = false"
      @material-added="handleMaterialAdded"
      @add-category="addCategory"
      @notification="showNotification"
    />
    
    <!-- Move Item Modal -->
    <div v-if="showMoveItemModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">Move Item</h3>
            <button @click="showMoveItemModal = false" class="text-gray-600 hover:text-gray-600/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedMaterial" class="mb-4">
            <p class="text-gray-600">Select a destination folder for <span class="font-medium text-white">{{ selectedMaterial.title }}</span>:</p>
          </div>
          
          <div class="max-h-60 overflow-y-auto border border-gray-400/500 rounded-xl mb-4">
            <div class="p-2 bg-[#c9d4a3]">
              <button 
                @click="moveDestination = 'root'"
                class="w-full flex items-center p-2 rounded hover:bg-bg-[#f7f2df]  transition-colors text-left"
                :class="{ 'bg-[#f7f2df] ': moveDestination === 'root' }"
              >
                <span>Root Folder</span>
              </button>
            </div>
            
            <div v-if="allFolders.length === 0" class="p-4 text-center text-gray-400">
              No folders available
            </div>
            
            <div v-else>
              <button 
                v-for="folder in allFolders" 
                :key="folder.id"
                @click="moveDestination = folder.id"
                class="w-full flex items-center p-2 rounded hover:bg-[#f7f2df] transition-colors text-left"
                :class="{ 'bg-[#f7f2df]': moveDestination === folder.id }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>{{ folder.name }}</span>
              </button>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showMoveItemModal = false"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="moveItem"
              class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-600/50 hover:text-white rounded-xl transition-colors"
              :disabled="!moveDestination"
            >
              Move
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bulk Move Modal -->
    <div v-if="showBulkMoveModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">Move Selected Items</h3>
            <button @click="showBulkMoveModal = false" class="text-gray-600 hover:text-gray-600/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mb-4">
            <p class="text-gray-600">Select a destination folder for <span class="font-medium text-[#c9d4a3]">{{ selectedMaterials.length }} selected items</span>:</p>
          </div>
          
          <div class="max-h-60 overflow-y-auto border border-gray-400/50 rounded-xl mb-4">
            <div class="p-2 bg-[#606c38]">
              <button 
                @click="moveDestination = 'root'"
                class="w-full flex items-center p-2 rounded hover:bg-[#f7f2df] transition-colors text-left"
                :class="{ 'bg-[#f7f2df]': moveDestination === 'root' }"
              >
                <span>Root Folder</span>
              </button>
            </div>
            
            <div v-if="allFolders.length === 0" class="p-4 text-center text-gray-400">
              No folders available
            </div>
            
            <div v-else>
              <button 
                v-for="folder in allFolders" 
                :key="folder.id"
                @click="moveDestination = folder.id"
                class="w-full flex items-center p-2 rounded bg-[#f7f2df] transition-colors text-left"
                :class="{ 'bg-[#f7f2df]': moveDestination === folder.id }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>{{ folder.name }}</span>
              </button>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showBulkMoveModal = false"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="bulkMoveMaterials"
              class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-600/50 hover:text-white rounded-xl
 transition-colors"
              :disabled="!moveDestination"
            >
              Move All Selected
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Folder Confirmation Modal -->
    <div v-if="showDeleteFolderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-red-600">Delete Folder</h3>
            <button @click="showDeleteFolderModal = false" class="text-gray-600 hover:text-gray-600/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedFolder" class="space-y-4">
            <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
              <p class="mb-2">Are you sure you want to delete this folder?</p>
              <p class="font-bold">Warning: This will also delete all materials inside this folder. This action cannot be undone.</p>
            </div>
            
            <div class="bg-white rounded-xl border border-gray-400/50 p-4">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-400 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">{{ selectedFolder.name }}</div>
                  <div class="text-sm text-gray-400">{{ selectedFolder.description || 'No description' }}</div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button 
                @click="showDeleteFolderModal = false"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="deleteFolder"
                class="px-4 py-2 bg-red-600 text-white hover:bg-red-600/50 hover:text-red-600 rounded-xl transition-colors"
                :disabled="isDeleting"
              >
                <span v-if="isDeleting">Deleting...</span>
                <span v-else>Delete Folder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Material Confirmation Modal -->
    <div v-if="showDeleteMaterialModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-red-600">Delete Document</h3>
            <button @click="showDeleteMaterialModal = false" class="text-gray-600 hover:text-gray-600/50

">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="selectedMaterial" class="space-y-4">
            <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-600">
              <p class="mb-2">Are you sure you want to delete this document?</p>
              <p class="font-bold">This action cannot be undone.</p>
            </div>

            <div class="bg-white border border-gray-400/50 rounded-xl p-4">
              <div class="flex items-center">
                <div class="mr-3">
                  <div class="os-file-icon small">
                    <span class="ext">{{ getFileExtension(selectedMaterial.fileName) }}</span>
                  </div>
                </div>
                <div>
                  <div class="font-medium">{{ selectedMaterial.title }}</div>
                  <div class="text-sm text-gray-400">{{ selectedMaterial.fileName }}</div>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button 
                @click="showDeleteMaterialModal = false"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-600/50 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="deleteMaterial"
                class="px-4 py-2 bg-red-600 text-white hover:bg-red-600/50 hover:text-red-600 rounded-xl transition-colors"
                :disabled="isDeleting"
              >
                <span v-if="isDeleting">Deleting...</span>
                <span v-else>Delete Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Preview Material Modal -->
    <div v-if="showPreviewModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div 
        :class="{ 
          'bg-white rounded-xl shadow-lg flex flex-col': !isFullscreen,
          'bg-black/40 flex flex-col': isFullscreen 
        }"
        :style="{ 
          width: isFullscreen ? '100%' : '95%', 
          height: isFullscreen ? '100%' : '95vh',
          maxWidth: isFullscreen ? '100%' : '1400px'
        }"
      >
        <!-- Modal Header -->
        <div 
          :class="{ 
            'p-4 border-b border-gray-300 flex items-center justify-between': !isFullscreen,
            'p-4 bg-black/60 flex items-center justify-between absolute top-0 left-0 right-0 z-10 transition-opacity duration-300': isFullscreen,
            'opacity-100': showControls && isFullscreen,
            'opacity-0': !showControls && isFullscreen
          }"
        >
          <div class="flex items-center">
            <h3 class="text-xl font-bold truncate mr-4 text-[#606c38]" v-if="previewMaterialData">{{ previewMaterialData.title }}</h3>
            <div v-if="previewMaterialData" class="hidden md:flex items-center space-x-2">
              <span 
                :class="{
                  'bg-purple-500/20 text-purple-400': previewMaterialData.fileType === 'document',
                  'bg-green-500/20 text-green-400': previewMaterialData.fileType === 'image',
                  'bg-red-500/20 text-red-400': previewMaterialData.fileType === 'video',
                  'bg-yellow-500/20 text-yellow-400': previewMaterialData.fileType === 'audio',
                  'bg-gray-500/20 text-gray-400': previewMaterialData.fileType === 'other'
                }"
                class="px-2 py-1 text-xs rounded-full"
              >
                {{ formatName(previewMaterialData.fileType) }}
              </span>
              <span class="text-sm text-gray-500">{{ formatDate(previewMaterialData.updatedAt || previewMaterialData.createdAt) }}</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="toggleFullscreen"
              class="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
              title="Toggle Fullscreen"
            >
              <svg v-if="isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
            <button 
              @click="showPreviewModal = false"
              class="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Modal Body -->
        <div 
          class="flex-1 overflow-auto relative"
          :class="{ 'bg-black': isFullscreen }"
          @mousemove="showControls = true"
          @mouseleave="handleMouseLeave"
        >
          <!-- Loading Indicator -->
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
          
          <!-- Content Preview -->
          <div 
            v-if="previewMaterialData" 
            class="w-full h-full flex items-center justify-center p-4"
            :class="{ 'p-0': isFullscreen }"
          >
            <!-- PDF Preview -->
            <iframe 
              v-if="previewMaterialData.fileType === 'document' && isPDF(previewMaterialData.fileUrl)"
              :src="previewMaterialData.fileUrl"
              class="w-full h-full border-0 rounded"
              @load="isLoading = false"
            ></iframe>
            
            <!-- Text File Preview -->
            <div 
              v-else-if="previewMaterialData.fileType === 'document' && isTextFile(previewMaterialData.fileName) && textContent"
              class="w-full h-full overflow-auto bg-gray-900 p-4 rounded"
              :style="{ transform: `scale(${viewerScale})`, transformOrigin: 'center top' }"
            >
              <pre class="text-gray-300 whitespace-pre-wrap font-mono text-sm">{{ textContent }}</pre>
            </div>
            
            <!-- Office Document Preview (using Google Docs Viewer) -->
            <iframe 
              v-else-if="previewMaterialData.fileType === 'document' && isOfficeDocument(previewMaterialData.fileName)"
              :src="`https://docs.google.com/viewer?url=${encodeURIComponent(previewMaterialData.fileUrl)}&embedded=true`"
              class="w-full h-full border-0 rounded"
              @load="isLoading = false"
            ></iframe>
            
            <!-- Image Preview -->
            <div 
              v-else-if="previewMaterialData.fileType === 'image'"
              class="relative flex items-center justify-center h-full"
              :style="{ transform: `scale(${viewerScale})`, transformOrigin: 'center center' }"
            >
              <img 
                :src="previewMaterialData.fileUrl" 
                :alt="previewMaterialData.title" 
                class="max-w-full max-h-full object-contain"
                @error="handlePreviewImageError"
                @load="isLoading = false"
              />
            </div>
            
            <!-- Video Preview -->
            <div 
              v-else-if="previewMaterialData.fileType === 'video'"
              class="w-full h-full flex items-center justify-center"
            >
              <video 
                :src="previewMaterialData.fileUrl" 
                controls 
                class="max-w-full max-h-full"
                @error="handlePreviewVideoError"
                @loadeddata="isLoading = false"
              ></video>
            </div>
            
            <!-- Audio Preview -->
            <div 
              v-else-if="previewMaterialData.fileType === 'audio'"
              class="w-full h-full flex flex-col items-center justify-center p-8"
            >
              <div class="w-16 h-16 mb-6 text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 class="text-lg font-medium mb-4">{{ previewMaterialData.title }}</h3>
              <audio 
                :src="previewMaterialData.fileUrl" 
                controls 
                class="w-full max-w-md"
                @error="handlePreviewAudioError"
                @loadeddata="isLoading = false"
              ></audio>
            </div>
            
            <!-- Other File Types -->
            <div v-else class="w-full h-full flex items-center justify-center">
              <iframe 
                :src="previewMaterialData.fileUrl" 
                class="w-full h-full border-0 rounded"
                @load="isLoading = false"
              ></iframe>
            </div>
          </div>
        </div>
        
        <!-- Modal Footer with File Details -->
        <div 
          :class="{ 
            'p-4 border-t border-gray-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4': !isFullscreen,
            'p-4 bg-black/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300': isFullscreen,
            'opacity-100': showControls && isFullscreen,
            'opacity-0': !showControls && isFullscreen
          }"
        >
          <div class="flex-1" v-if="previewMaterialData">
            <div class="flex flex-wrap gap-12">
              <div>
                <div class="text-xs text-gray-600 uppercase">File Name</div>
                <div class="text-sm text-gray-500">{{ previewMaterialData.fileName }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-600 uppercase">Size</div>
                <div class="text-sm text-gray-500">{{ formatFileSize(previewMaterialData.fileSize) }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-600 uppercase">Category</div>
                <div class="text-sm text-gray-500">{{ formatName(previewMaterialData.category) }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-600 uppercase">Uploaded By</div>
                <div class="text-sm text-gray-500">{{ previewMaterialData.uploadedBy || 'Unknown' }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-600 uppercase">Last Modified</div>
                <div class="text-sm text-gray-500">{{ formatDate(previewMaterialData.updatedAt || previewMaterialData.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div class="flex space-x-2 shrink-0">
            <button 
              v-if="previewMaterialData"
              @click="renameMaterial(previewMaterialData)"
              class="px-4 py-2 bg-yellow-500 hover:bg-yellow-300 text-white rounded-xl transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h11M3 6h11M3 14h7M14 10l7 7m0 0l-7 7m7-7H7" />
              </svg>
              Rename
            </button>
            <button 
              v-if="previewMaterialData"
              @click="downloadMaterial(previewMaterialData)"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded-xl transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sign Out Confirmation Modal -->
    <SignOutConfirmation 
      :show="showSignOutConfirmation"
      @confirm="handleSignOut"
      @cancel="showSignOutConfirmation = false"
    />
    
    <!-- Page Loader -->
    <PageLoader :is-loading="isLoading" />
  </div>
</template>

<style scoped>
/* Desktop-like icon tile */
.os-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 8px;
  border-radius: 10px;
  transition: background-color 120ms ease, box-shadow 120ms ease;
  position: relative;
}
.os-tile:hover { background: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.os-tile .icon-wrapper {
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.os-tile .label {
  width: 100%;
  max-width: 120px;
  text-align: center;
  font-size: 12px;
  line-height: 1.2;
  color: #111827; /* gray-900 */
  padding: 4px 6px;
  border-radius: 6px;
  word-break: break-word;
}
.os-tile:hover .label { background: #eef2ff; /* indigo-50 */ }

/* Desktop-like folder icon */
.os-folder-icon {
  position: relative;
  width: 40px;
  height: 28px;
  background: linear-gradient(180deg, #6aa7ff 0%, #3a7bfd 100%);
  border-radius: 4px;
  box-shadow: inset 0 -2px 0 rgba(0,0,0,0.08);
}
.os-folder-icon::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 4px;
  width: 18px;
  height: 8px;
  background: #8dbaff;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  box-shadow: inset 0 -1px 0 rgba(0,0,0,0.08);
}
.os-folder-icon.small { width: 36px; height: 24px; }
.os-folder-icon.small::before { width: 16px; height: 7px; top: -5px; }
.os-folder-icon.large { width: 84px; height: 56px; border-radius: 6px; }
.os-folder-icon.large::before { width: 36px; height: 12px; top: -10px; left: 8px; }

/* Desktop-like file icon */
.os-file-icon {
  position: relative;
  width: 36px;
  height: 44px;
  background: #ffffff;
  border: 1px solid #e5e7eb; /* gray-200 */
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.03);
}
.os-file-icon::before { /* folded corner */
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #e5e7eb 0 50%, transparent 50% 100%);
  border-top-right-radius: 4px;
}
.os-file-icon .ext {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  display: inline-block;
  padding: 2px 4px;
  font-size: 10px;
  font-weight: 700;
  color: #1f2937; /* gray-800 */
  text-transform: uppercase;
  text-align: center;
  background: #e5e7eb; /* gray-200 */
  border-radius: 3px;
}
.os-file-icon.small { width: 28px; height: 34px; }
.os-file-icon.small .ext { font-size: 9px; bottom: 3px; }
.os-file-icon.large { width: 72px; height: 90px; }
.os-file-icon.large .ext { font-size: 12px; bottom: 6px; }
.os-file-icon.video .ext { background: #fecaca; color: #991b1b; }
.os-file-icon.audio .ext { background: #fef3c7; color: #92400e; }
.os-file-icon.document .ext { background: #ede9fe; color: #5b21b6; }
.os-file-icon.image .ext { background: #dcfce7; color: #166534; }

/* Three-dot contextual menu */
.menu-wrapper {
  position: absolute;
  top: 6px;
  right: 6px;
}
.menu-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  border-radius: 6px;
  color: #4b5563; /* gray-600 */
  background: #ffffffaa;
  backdrop-filter: blur(2px);
}
.menu-btn:hover { background: #ffffff; color: #111827; box-shadow: 0 1px 6px rgba(0,0,0,0.12); }
.menu-dropdown {
  position: absolute;
  top: 34px;
  right: 0;
  width: 160px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
  padding: 6px;
  z-index: 20;
}
.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #111827; /* gray-900 */
}
.menu-item:hover { background: #f3f4f6; }
.menu-item.danger { color: #b91c1c; }
.menu-item.danger:hover { background: #fee2e2; }
</style>
