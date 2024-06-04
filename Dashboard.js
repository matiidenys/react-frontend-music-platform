import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const [audioList, setAudioList] = useState([]);
    const [isAudioListVisible, setIsAudioListVisible] = useState(false);
    const [isUploadFormVisible, setIsUploadFormVisible] = useState(false);
    const [isAudioFetched, setIsAudioFetched] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState('');
//
    // функція щоб отримати всу музику з бази даних
    const fetchAudioList = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/music/get', {
                credentials: 'include',
                headers: {
                    'Authorization': 'Basic ' + btoa('admin:admin')
                }
            });
            const data = await response.json();

            if (Array.isArray(data)) {
                const audioList = data.map(item => {
                    const audioBlob = b64toBlob(item.data.data, 'audio/mpeg');
                    const audioUrl = URL.createObjectURL(audioBlob);

                    return {
                        id: item.id,
                        name: item.name,
                        url: audioUrl
                    };
                });
                setAudioList(audioList);
                setIsAudioFetched(true);
            } else {
                console.error('Invalid audio data format');
            }
        } catch (error) {
            console.error('Error fetching audio:', error);
        }
    };

    //функція щоб музику у вигляді тексту перетворити на аудіо
    const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };

    //функція для опрацювання вводу у формах
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file || !name) {
            alert('Будь ласка, надайте і файл, і назву.');
            return;
        }

        if (file.type !== 'audio/mpeg') {
            alert('Тільки mp3 файли дозволено.');
            return;
        }

        const formData = new FormData();
        formData.append('data', file);
        formData.append('name', name);

        try {
            const response = await fetch('http://localhost:8080/api/v1/music/create', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': 'Basic ' + btoa('admin:admin')
                },
                body: formData
            });

            if (response.ok) {
                alert('Файли вигружено успішно.');
            } else {
                alert('Не вдалося вигрузити файли.');
            }
        } catch (error) {
            console.error('Помилка при вигрузці файла:', error);
        }
    };
    // перемикнути список музики
    const toggleAudioList = () => {
        if (!isAudioFetched) {
            fetchAudioList().then(() => setIsAudioListVisible(true));
        } else {
            setIsAudioListVisible(!isAudioListVisible);
        }
    };
    //перезагрузити список музики
    const refreshAudioList = () => {
        fetchAudioList();
    };
    //перемикнути форму вигрузки
    const toggleUploadForm = () => {
        setIsUploadFormVisible(!isUploadFormVisible);
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type !== 'audio/mpeg') {
            setFileError('Тільки mp3 файли дозволено.');
            setFile(null);
        } else {
            setFileError('');
            setFile(selectedFile);
        }
    };
    //перемикнути форму пошуку
    const toggleSearchForm = () => {
        setIsSearchVisible(!isSearchVisible);
    };
    //функція для подання запиту пошуку
    const handleSearch = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`http://localhost:8080/api/v1/music/search/${searchName}`, {
                credentials: 'include',
                headers: {
                    'Authorization': 'Basic ' + btoa('admin:admin')
                }
            });
            const data = await response.json();

            if (Array.isArray(data)) {
                const searchResults = data.map(item => {
                    const audioBlob = b64toBlob(item.data.data, 'audio/mpeg');
                    const audioUrl = URL.createObjectURL(audioBlob);

                    return {
                        id: item.id,
                        name: item.name,
                        url: audioUrl
                    };
                });
                setSearchResults(searchResults);
            } else {
                console.error('Неправильний формат результату пошуку');
            }
        } catch (error) {
            console.error('Помилка у пошуку аудіо:', error);
        }
    };

    return (
        <div className="dashboard">
            <h2>Платформа обміну музикою</h2>
            <p>Ласкаво просимо до нашої платформи!</p>
            <div className="dashboard-columns">
                <div className={`dashboard-column ${isAudioListVisible ? 'expanded' : ''}`}>
                    <button onClick={toggleAudioList}>
                        {isAudioListVisible ? 'Сховати всю музику' : 'Показати всю музику'}
                    </button>
                    {isAudioListVisible && (
                        <div>
                            <button onClick={refreshAudioList}>Перезавантажити список пісень</button>
                            {audioList.map(audio => (
                                <div key={audio.id}>
                                    <p>{audio.name}</p>
                                    <audio controls src={audio.url} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`dashboard-column ${isUploadFormVisible ? 'expanded' : ''}`}>
                    <button onClick={toggleUploadForm}>
                        {isUploadFormVisible ? 'Сховати форму вигрузки своїх пісень' : 'Показати форму вигрузки своїх пісень'}
                    </button>
                    {isUploadFormVisible && (
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>
                                    Назва:
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Файл:
                                    <input
                                        type="file"
                                        accept="audio/mpeg"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </label>
                                {fileError && <p style={{ color: 'red' }}>{fileError}</p>}
                            </div>
                            <button type="submit">Вигрузити</button>
                        </form>
                    )}
                </div>

                <div className={`dashboard-column ${isSearchVisible ? 'expanded' : ''}`}>
                    <button onClick={toggleSearchForm}>
                        {isSearchVisible ? 'Сховати форму пошуку' : 'Показати форму пошуку'}
                    </button>
                    {isSearchVisible && (
                        <form onSubmit={handleSearch}>
                            <div>
                                <label>
                                    Пошук по імені:
                                    <input
                                        type="text"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        required
                                    />
                                </label>
                            </div>
                            <button type="submit">Пошук</button>
                        </form>
                    )}
                    {searchResults.length > 0 && isSearchVisible && (
                        <div>
                            <h3>Результати пошуку:</h3>
                            {searchResults.map(audio => (
                                <div key={audio.id}>
                                    <p>{audio.name}</p>
                                    <audio controls src={audio.url} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
