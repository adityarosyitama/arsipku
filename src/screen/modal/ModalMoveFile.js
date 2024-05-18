import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RNFS from 'react-native-fs';

export const ModalMoveFile = ({
  show,
  onClose,
  currentFile,
  folders,
  moveToFolder,
}) => {
  // console.log('move');
  // console.log(folders);
  // const filteredFolders = folders;
  const filteredFolders =
    folders.length > 0
      ? folders.filter(item => item.path !== currentFile?.path)
      : [];

  const rootPath = RNFS.DocumentDirectoryPath;

  const movingFile = newPath => {
    moveToFolder(newPath);
    onClose();
  };

  return (
    <Modal transparent visible={show} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Move</Text>
          </View>
          <View style={styles.modalInputContainer}>
            <View style={styles.listContent}>
              <FontAwesome name="folder" size={24} color="#F8D775" />
              <Text onPress={() => movingFile(rootPath)}>Root (Files)</Text>
            </View>

            {filteredFolders.length === 0 && (
              <Text style={styles.textCenter}>No folder available</Text>
            )}

            {filteredFolders.length > 0 && (
              <>
                <Text style={styles.modalInputLabel}>Select Folder</Text>
                <FlatList
                  data={filteredFolders}
                  keyExtractor={item => item.path}
                  renderItem={({item}) => (
                    <TouchableOpacity>
                      <View style={styles.listContent}>
                        <FontAwesome name="folder" size={24} color="#F8D775" />
                        <Text onPress={() => movingFile(item.path)}>
                          {item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </View>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  listContent: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    borderWidth: 0.5,
    bordeColor: '#ececec',
    borderRadius: 3,
    flexDirection: 'row',
    marginBottom: 12,
  },
  textCenter: {
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 36,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  modalHeader: {
    width: '100%',
  },
  modalHeaderText: {
    color: '#292524',
    fontSize: 18,
    fontWeight: '500',
  },
  modalInputContainer: {
    width: '100%',
    marginVertical: 8,
  },
  modalInputLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
  },
  modalInput: {
    marginVertical: 12,
    width: '100%',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#3b82f6',
    color: '#007bff',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
  },
  modalButtonOk: {
    marginLeft: 28,
  },
  modalButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});
