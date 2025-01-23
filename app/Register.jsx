import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from './services/firebaseConfig'; // Configura Firebase aquí
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Link, useRouter, useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as Cellular from 'expo-cellular';
import Checkbox from 'expo-checkbox';



const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);


  const router = useRouter();


  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDateOfBirth(formattedDate);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !gender) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    if (!isTermsAccepted) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones.');
      return;
    }

    const deviceId = Application.getAndroidId();

    const userInfo = {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
      deviceId,
      createdAt: Date.now(),
      androidVersion: Device.osVersion,
      deviceBrand: Device.brand,
      operator: Cellular.getCarrierNameAsync(),
      manufacturer: Device.manufacturer,
      model: Device.modelName,
    };

    console.log('Registrando usuario:', userInfo);

    try {
      const userDocRef = doc(db, 'users', deviceId); // Crea una referencia al documento
      await setDoc(userDocRef, userInfo); // Guarda los datos en Firestore
      Alert.alert('Éxito', 'Registro exitoso');
      // Guarda el estado de registro en AsyncStorage
      await AsyncStorage.setItem('isRegistered', 'true');
      router.push('./index'); // Redirige al reproductor
    } catch (error) {
      console.error('Error al registrar:', error);
      Alert.alert('Error', 'Hubo un problema al registrar al usuario.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => setGender(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione un género" value="" />
        <Picker.Item label="Masculino" value="Masculino" />
        <Picker.Item label="Femenino" value="Femenino" />
        <Picker.Item label="Otro" value="Otro" />
      </Picker>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text>{dateOfBirth || 'Selecciona tu fecha de nacimiento'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={new Date()} mode="date" display="default" onChange={handleDateChange} />
      )}

       {/* Checkbox para términos y condiciones */}
      <View style={styles.termsContainer}>
        <Checkbox
          value={isTermsAccepted}
          onValueChange={setIsTermsAccepted}
          color={isTermsAccepted ? '#4A90E2' : undefined}
          style={styles.checkbox}
        />
        <Text style={styles.termsText}>
          Acepto los <Text style={styles.linkText}>términos y condiciones</Text>
        </Text>
      </View>

      <Button title="Registrarse" onPress={handleRegister} />
    </View>
  );
};

// Configura las opciones de la pantalla
Register.options = {
  headerShown: false, // Oculta la navbar
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  datePicker: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 15,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  termsText: {
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
});

export default Register;
