import { ref } from 'vue';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useDragAndDrop(materials, showNotification) {
  const draggedItem = ref(null);
  const dragOverFolderId = ref(null);

  // Start dragging a material
  const startDrag = (material) => {
    draggedItem.value = material;
  };

  // Handle drag over a folder
  const dragOver = (folderId, event) => {
    // Only allow dropping on folders
    if (folderId !== draggedItem.value?.id) {
      event.dataTransfer.dropEffect = 'move';
      dragOverFolderId.value = folderId;
    } else {
      // Can't drop on itself
      event.dataTransfer.dropEffect = 'none';
    }
  };

  // Handle drag leave
  const dragLeave = () => {
    dragOverFolderId.value = null;
  };

  // Handle drop on a folder
  const dropOnFolder = async (folderId, event) => {
    event.preventDefault();
    
    // Reset drag over state
    dragOverFolderId.value = null;
    
    // Make sure we have a dragged item
    if (!draggedItem.value) return;
    
    // Don't allow dropping on itself
    if (draggedItem.value.id === folderId) return;
    
    // Don't move if already in the target folder
    if (draggedItem.value.folderId === folderId) {
      showNotification('Item is already in this folder', 'info');
      return;
    }
    
    try {
      // First, verify that both the source item and target folder exist
      const materialRef = doc(db, "learningMaterials", draggedItem.value.id);
      const materialDoc = await getDoc(materialRef);
      
      if (!materialDoc.exists()) {
        showNotification(`The item you're trying to move doesn't exist in the database`, 'error');
        return;
      }
      
      // If the target is not 'root', verify the folder exists
      if (folderId !== 'root') {
        const folderRef = doc(db, "learningMaterials", folderId);
        const folderDoc = await getDoc(folderRef);
        
        if (!folderDoc.exists()) {
          showNotification(`The destination folder doesn't exist in the database`, 'error');
          return;
        }
      }
      
      // Update in Firestore
      await updateDoc(materialRef, {
        folderId: folderId,
        updatedAt: serverTimestamp()
      });
      
      // Update in local state
      const index = materials.value.findIndex(m => m.id === draggedItem.value.id);
      if (index !== -1) {
        materials.value[index] = {
          ...materials.value[index],
          folderId: folderId,
          updatedAt: new Date() // Use current date for immediate display
        };
      }
      
      showNotification('Item moved successfully', 'success');
    } catch (err) {
      console.error("Error moving item:", err);
      showNotification('Error moving item: ' + err.message, 'error');
    }
    
    // Reset dragged item
    draggedItem.value = null;
  };

  // Move multiple selected materials to a folder
  const moveSelectedToFolder = async (selectedMaterials, destinationFolderId) => {
    if (selectedMaterials.length === 0) return;
    
    try {
      // First, verify the destination folder exists (if not root)
      if (destinationFolderId !== 'root') {
        const folderRef = doc(db, "learningMaterials", destinationFolderId);
        const folderDoc = await getDoc(folderRef);
        
        if (!folderDoc.exists()) {
          showNotification(`The destination folder doesn't exist in the database`, 'error');
          return;
        }
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      // Process each material
      for (const material of selectedMaterials) {
        // Skip if already in the target folder
        if (material.folderId === destinationFolderId) continue;
        
        try {
          // Verify the material exists
          const materialRef = doc(db, "learningMaterials", material.id);
          const materialDoc = await getDoc(materialRef);
          
          if (!materialDoc.exists()) {
            errorCount++;
            continue;
          }
          
          // Update in Firestore
          await updateDoc(materialRef, {
            folderId: destinationFolderId,
            updatedAt: serverTimestamp()
          });
          
          // Update in local state
          const index = materials.value.findIndex(m => m.id === material.id);
          if (index !== -1) {
            materials.value[index] = {
              ...materials.value[index],
              folderId: destinationFolderId,
              updatedAt: new Date() // Use current date for immediate display
            };
          }
          
          successCount++;
        } catch (err) {
          console.error(`Error moving item ${material.id}:`, err);
          errorCount++;
        }
      }
      
      // Show notification based on results
      if (errorCount === 0) {
        showNotification(`Successfully moved ${successCount} item(s)`, 'success');
      } else if (successCount === 0) {
        showNotification(`Failed to move any items`, 'error');
      } else {
        showNotification(`Moved ${successCount} item(s), failed to move ${errorCount} item(s)`, 'warning');
      }
      
    } catch (err) {
      console.error("Error in bulk move operation:", err);
      showNotification('Error moving items: ' + err.message, 'error');
    }
  };

  return {
    draggedItem,
    dragOverFolderId,
    startDrag,
    dragOver,
    dragLeave,
    dropOnFolder,
    moveSelectedToFolder
  };
}