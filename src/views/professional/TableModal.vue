import { ref, computed } from 'vue';

export function useRichTextEditor() {
  // State
  const isFullscreen = ref(false);
  const showWordCount = ref(false);
  const showTableModal = ref(false);
  const showImageModal = ref(false);
  const activeTab = ref('');
  
  // Methods
  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
    
    // When entering fullscreen, add a class to the body to prevent scrolling
    if (isFullscreen.value) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };
  
  const toggleWordCount = () => {
    showWordCount.value = !showWordCount.value;
  };
  
  const openTableModal = () => {
    showTableModal.value = true;
  };
  
  const closeTableModal = () => {
    showTableModal.value = false;
  };
  
  const openImageModal = () => {
    showImageModal.value = true;
  };
  
  const closeImageModal = () => {
    showImageModal.value = false;
  };
  
  const setActiveTab = (tab) => {
    activeTab.value = tab;
  };
  
  // Get the editor instance for a specific field
  const getEditorForField = (field, disease, editorRefs) => {
    if (!editorRefs || !editorRefs[field]) return null;
    return editorRefs[field].editor;
  };
  
  // Insert table into the editor
  const insertTable = (params, editorRefs, field) => {
    const editor = getEditorForField(field, null, editorRefs);
    if (editor) {
      editor.commands.insertTable(params);
    }
  };
  
  // Insert image into the editor
  const insertImage = (params, editorRefs, field) => {
    const editor = getEditorForField(field, null, editorRefs);
    if (editor) {
      editor.commands.insertContent(`<img src="${params.src}" alt="${params.alt}" />`);
    }
  };
  
  return {
    // State
    isFullscreen,
    showWordCount,
    showTableModal,
    showImageModal,
    activeTab,
    
    // Methods
    toggleFullscreen,
    toggleWordCount,
    openTableModal,
    closeTableModal,
    openImageModal,
    closeImageModal,
    setActiveTab,
    getEditorForField,
    insertTable,
    insertImage
  };
}