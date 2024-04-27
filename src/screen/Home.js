/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import {ModalNewFolder} from './modal/ModalNewFolder';
import {ModalAddFile} from './modal/ModalAddFile';
import RNFS from 'react-native-fs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {ModalConvertFile} from './modal/ModalConvertFile';
import {ModalImage} from './modal/ModalImage';
import {ModalRename} from './modal/ModalRename';

export default function Home({navigation}) {
  const [currentPath, setCurrentPath] = useState(RNFS.DocumentDirectoryPath);
  const [folders, setFolders] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const [modalFolder, setModalFolder] = useState(false);
  const [modalFile, setModalFile] = useState(false);
  const [modalConvert, setModalConvert] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [img, setImg] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [modalRename, setModalRename] = useState(false);

  useEffect(() => {
    getAllFolders(currentPath);
  }, [currentPath]);

  useEffect(() => {
    filterFolders();
  }, [folders, searchText]);

  useEffect(() => {
    setSearchText('');
  }, [img]);

  const getAllFolders = path => {
    RNFS.readDir(path)
      .then(result => {
        setFolders(result);
      })
      .catch(error => {
        console.error('Error reading folder:', error);
      });
  };

  const filterFolders = () => {
    if (searchText.trim() === '') {
      setFilteredFolders(folders);
    } else {
      const filtered = folders.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredFolders(filtered);
    }
  };

  const createFolder = () => {
    const newPath = `${currentPath}/${folderName}`;
    RNFS.mkdir(newPath)
      .then(() => {
        setFolderName('');
        getAllFolders(currentPath);
        console.log('Created new folder:', newPath); // Tambahkan log untuk menampilkan path folder yang baru dibuat
      })
      .catch(error => {
        console.error('Error creating folder:', error);
      });
  };

  const deleteDir = path => {
    RNFS.unlink(path)
      .then(() => {
        getAllFolders(currentPath);
      })
      .catch(error => {
        console.error('Error deleting folder:', error);
      });
  };

  const navigateBack = () => {
    // Define the stop directory path
    const stopDirectoryPath = '/data/user/0/com.arsipku/files';
    // If currentPath is already at stop directory, do nothing
    if (currentPath === stopDirectoryPath) {
      return;
    }
    // Define the root directory path
    const rootDirectoryPath = '/data/user/0/com.arsipku';
    // Remove the last part of the current path to navigate to the parent directory
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    // If the parent path is the root directory path, set currentPath to stop directory
    if (parentPath === rootDirectoryPath) {
      setCurrentPath(stopDirectoryPath);
      console.log('Entered folder:', stopDirectoryPath); // Log saat tombol back berhenti di stop directory
    } else {
      // Otherwise, navigate to the parent directory
      setCurrentPath(parentPath);
      console.log('Entered folder:', parentPath); // Log saat tombol back ditekan
    }
    // Reset search text when navigating back
    setSearchText('');
  };

  const sortData = () => {
    // Buat salinan array folders agar tidak merubah state langsung
    const sortedFolders = [...folders];
    // Logika pengurutan data
    if (sortDirection === 'asc') {
      // Urutkan data dari A ke Z
      sortedFolders.sort((a, b) => a.name.localeCompare(b.name));
      // Ubah arah pengurutan menjadi descending
      setSortDirection('desc');
    } else {
      // Urutkan data dari Z ke A
      sortedFolders.sort((a, b) => b.name.localeCompare(a.name));
      // Ubah arah pengurutan menjadi ascending
      setSortDirection('asc');
    }
    // Perbarui state folders dengan data yang sudah diurutkan
    setFolders(sortedFolders);
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 1,
      includeBase64: false,
      saveToPhotos: true, // Menyimpan ke galeri setelah diambil
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode) {
        console.log(
          'Camera Error: ',
          response.errorCode,
          response.errorMessage,
        );
      } else {
        console.log('Camera Response: ', response);
        // Simpan gambar sebagai file .png
        saveImageAsPng(response.assets[0], currentPath);
      }
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 1,
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log(
          'ImagePicker Error: ',
          response.errorCode,
          response.errorMessage,
        );
      } else {
        console.log('ImagePicker Response: ', response);
        // Simpan gambar sebagai file .png
        saveImageAsPng(response.assets[0], currentPath);
      }
    });
  };

  const saveImageAsPng = async (asset, currentPath) => {
    const sourcePath = asset.uri; // Path dari gambar yang diambil
    const fileNamePrefix = 'IMG_'; // Awalan nama file
    // Mendapatkan detik saat ini dengan dua digit
    const seconds = new Date().getSeconds().toString().padStart(2, '0');
    // Membuat nama file baru dengan awalan dan detik
    const newFileName = `${fileNamePrefix}${seconds}.png`;
    const destinationPath = `${currentPath}/${newFileName}`; // Path untuk menyimpan gambar sebagai .png
    try {
      // Membaca konten gambar
      const imageContent = await RNFS.readFile(sourcePath, 'base64');
      // Menyimpan konten gambar sebagai file .png
      await RNFS.writeFile(destinationPath, imageContent, 'base64');
      console.log('Image saved as .png:', destinationPath);
      // Perbarui daftar folder setelah menyimpan gambar
      getAllFolders(currentPath);
    } catch (error) {
      console.error('Error saving image as .png:', error);
    }
  };

  const onConvertSuccess = async pdfFilePath => {
    const folderPath =
      currentPath !== RNFS.DocumentDirectoryPath
        ? currentPath
        : RNFS.DocumentDirectoryPath;
    const fileNamePrefix = 'PDF_';
    const currentDate = new Date();
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');
    const newFileName = `${fileNamePrefix}${seconds}.pdf`;
    const destinationPath = `${folderPath}/${newFileName}`;
    try {
      const isFileExists = await RNFS.exists(destinationPath);
      let finalDestinationPath = destinationPath;
      if (isFileExists) {
        let count = 1;
        let uniqueFileName = newFileName;
        while (await RNFS.exists(`${folderPath}/${uniqueFileName}`)) {
          uniqueFileName = `${fileNamePrefix}${seconds}_${count++}.pdf`;
        }
        finalDestinationPath = `${folderPath}/${uniqueFileName}`;
      }
      await RNFS.moveFile(pdfFilePath, finalDestinationPath);
      console.log('PDF file saved:', finalDestinationPath); // Print the saved PDF file path
      const pdfFile = {
        name: finalDestinationPath.split('/').pop(),
        path: finalDestinationPath,
        isDirectory: () => false,
      };
      setFolders([...folders, pdfFile]);
    } catch (error) {
      console.error('Error saving PDF file:', error);
    }
    setModalConvert(false);
  };

  const downloadFile = async item => {
    const downloadPath = '/storage/emulated/0/download';
    const fileName = item.name.split('/').pop(); // Mendapatkan nama file dari URI
    const localFilePath = `${downloadPath}/${fileName}`;
    try {
      await RNFS.copyFile(item.path, localFilePath);
      console.log('File downloaded to:', localFilePath);
      Alert.alert(
        'Success',
        'PDF downloaded successfully\n\nDownloaded files can be seen in the download folder in internal storage',
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download PDF');
    }
    handleClosePress();
  };

  const navigateToFolder = item => {
    if (item.isDirectory()) {
      setCurrentPath(item.path);
      console.log('Entered folder:', item.path);
      setSearchText('');
    } else if (item.name.toLowerCase().endsWith('.pdf')) {
      navigation.navigate('PdfViewer', {pdfPath: item.path});
      setSearchText('');
    } else if (item.name.toLowerCase().endsWith('.png')) {
      setImg(item.path);
    }
  };

  const handleMenuPress = (item) => {
    setSelectedItem(item);
  };
  
  const handleClosePress = () => {
    setSelectedItem(null);
  };
  
  const handleDeletePress = (item) => {
    Alert.alert(
      `Delete ${item.isDirectory() ? 'Folder' : 'File'}`,
      `Are you sure you want to delete ${item.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            deleteDir(item.path);
            Alert.alert(
              `Delete ${item.isDirectory() ? 'Folder' : 'File'}`,
              `${item.name} successfully deleted`,
            );
            handleClosePress();
          },
          style: 'destructive',
        },
      ],
    );
  };

  const renameFile = async () => {
    try {
      let newPath = '';
      // Lakukan pengecekan jenis file dan proses rename sesuai dengan jenis file
      if (selectedItem.path.toLowerCase().endsWith('.png')) {
        newPath = `${selectedItem.path.substring(
          0,
          selectedItem.path.lastIndexOf('/'),
        )}/${newName}.png`;
        await RNFS.moveFile(selectedItem.path, newPath);
      } else if (selectedItem.path.toLowerCase().endsWith('.pdf')) {
        newPath = `${selectedItem.path.substring(
          0,
          selectedItem.path.lastIndexOf('/'),
        )}/${newName}.pdf`;
        await RNFS.moveFile(selectedItem.path, newPath);
      } else {
        newPath = `${selectedItem.path.substring(
          0,
          selectedItem.path.lastIndexOf('/'),
        )}/${newName}`;
        await RNFS.moveFile(selectedItem.path, newPath);
      }
      console.log('File renamed successfully:', newPath);
      // Perbarui daftar folder setelah rename berhasil
      getAllFolders(
        selectedItem.path.substring(0, selectedItem.path.lastIndexOf('/')),
      );
    } catch (error) {
      console.error('Error renaming file:', error);
    }
    handleClosePress();
  };  

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => navigateToFolder(item)}>
          <View style={styles.itemContent}>
            <View style={styles.iconContainer}>
              {item.isDirectory() ? (
                <FontAwesome name="folder" size={24} color="#F8D775" />
              ) : item.name.toLowerCase().endsWith('.png') ? (
                <FontAwesome name="image" size={20} color="#87CEEB" />
              ) : item.name.toLowerCase().endsWith('.pdf') ? (
                <FontAwesome name="file-pdf-o" size={24} color="red" />
              ) : (
                <FontAwesome name="file-text" size={24} color="gray" />
              )}
            </View>
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.itemContent}>
          {selectedItem === item && (
            <View style={styles.containerMenu}>
              <TouchableOpacity onPress={() => setModalRename(true)} style={styles.menu}>
                <AntDesign name="edit" size={18} color="gray" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeletePress(item)} style={styles.menu}>
                <AntDesign name="delete" size={18} color="gray" />
              </TouchableOpacity>
              {/* Render download menu item only if the file is a PDF */}
              {item.name.toLowerCase().endsWith('.pdf') && (
                <TouchableOpacity onPress={() => downloadFile(item)} style={styles.menu}>
                  <AntDesign name="download" size={18} color="gray" />
                </TouchableOpacity>
              )}
            </View>
          )}
          {!selectedItem && (
            <TouchableOpacity onPress={() => handleMenuPress(item)}>
              <AntDesign name="ellipsis1" size={18} color="gray" />
            </TouchableOpacity>
          )}
          {selectedItem === item && (
            <TouchableOpacity onPress={handleClosePress}>
              <AntDesign name="close" size={18} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ModalImage item={img} setItem={setImg} />
      <ModalNewFolder
        show={modalFolder}
        onClose={() => setModalFolder(false)}
        folderName={folderName}
        setFolderName={setFolderName}
        createFolder={createFolder}
      />
      <ModalAddFile
        show={modalFile}
        onClose={() => setModalFile(false)}
        openCamera={openCamera}
        openImageLibrary={openImageLibrary}
      />
      <ModalConvertFile
        show={modalConvert}
        onClose={() => setModalConvert(false)}
        onConvertSuccess={onConvertSuccess}
      />
      <ModalRename
        show={modalRename}
        onClose={() => { setModalRename(false); handleClosePress(); }}
        newName={newName}
        setNewName={setNewName}
        renameFile={renameFile}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContainer}>
        <ImageBackground
          source={require('../assets/images/ArsipBg.png')}
          resizeMode="cover"
          style={styles.imageBackground}>
          <Image
            source={require('../assets/images/ArsipkuWhite.png')}
            style={styles.logo}
          />
          <View style={styles.searchFilter}>
            <View style={styles.searchInputContainer}>
              <AntDesign name="search1" size={20} color="gray" />

              <TextInput
                placeholderTextColor={'#007bff'}
                placeholder="Search File..."
                style={styles.searchInput}
                value={searchText}
                onChangeText={text => setSearchText(text)}
              />
              {searchText !== '' && ( // Show cancel button if searchText is not empty
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <AntDesign name="close" size={20} color="gray" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ImageBackground>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonColumn}>
            <TouchableOpacity
              onPress={() => {
                setModalFolder(true);
              }}>
              <LinearGradient
                start={{x: 0, y: 1}}
                end={{x: 1, y: 0}}
                colors={['#F5C62C', '#FD5B4B']}
                style={styles.button}>
                <AntDesign name="addfolder" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.buttonText}>New Folder</Text>
          </View>
          <View style={styles.buttonColumn}>
            <TouchableOpacity
              onPress={() => {
                setModalFile(true);
              }}>
              <LinearGradient
                start={{x: 0, y: 1}}
                end={{x: 1, y: 0}}
                colors={['#D8E474', '#62C654']}
                style={styles.button}>
                <FontAwesome name="file-photo-o" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.buttonText}>Add Photo</Text>
          </View>
          <View style={styles.buttonColumn}>
            <TouchableOpacity
              onPress={() => {
                setModalConvert(true);
              }}>
              <LinearGradient
                start={{x: 0, y: 1}}
                end={{x: 1, y: 0}}
                colors={['#8FF8D4', '#16AAFB']}
                style={styles.button}>
                <AntDesign name="pdffile1" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.buttonText}>Convert PDF</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
              <AntDesign name="arrowleft" size={24} style={styles.backIcon} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{currentPath.split('/').pop()}</Text>
            </View>
            <TouchableOpacity onPress={sortData}>
              <View style={styles.sortContainer}>
                <Text style={styles.sortText}>
                  {sortDirection === 'asc' ? 'Z - A' : 'A - Z'}
                </Text>
                <AntDesign
                  name={sortDirection === 'asc' ? 'caretdown' : 'caretup'}
                  size={16}
                  style={styles.sortIcon}
                />
              </View>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredFolders}
            renderItem={renderItem}
            keyExtractor={item => item.path}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollViewContainer: {
    paddingBottom: 10,
  },
  imageBackground: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    height: 176,
  },
  logo: {
    width: 106,
    height: 26,
  },
  buttonContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonColumn: {
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1917',
    paddingTop: 16,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContainer: {
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingHorizontal: 16,
  },
  backIcon: {
    tintColor: '#000',
    color: '#000',
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 20,
    color: '#696969',
    textTransform: 'capitalize',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingRight: 12,
    color: '#696969',
  },
  sortIcon: {},
  itemContainer: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#f1f5f9',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  containerMenu: {
    flexDirection: 'row',
  },
  menu: {
    paddingRight: 8,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#322f2e',
  },
  downloadIcon: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  searchFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  searchInputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 10,
    width: '100%',
    height: 45,
    backgroundColor: '#F6F8FF',
    borderRadius: 8,
  },
  searchButton: {
    marginLeft: 10,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    width: '80%',
    color: '#007bff',
  },
});
