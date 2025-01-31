import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'

const TermsAndConditions = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Términos y Condiciones</Text>
      <Text style={styles.lastUpdated}>
        Última actualización: {new Date().toLocaleDateString()}
      </Text>
      <Text style={styles.content}>
        Estos Términos y Condiciones (en adelante, los "Términos") regulan el
        uso de la aplicación móvil (en adelante, la "Aplicación") desarrollada
        por [Nombre de tu empresa o desarrollador] (en adelante, "nosotros" o
        "nuestro"). Al registrarte y utilizar la Aplicación, aceptas estar
        legalmente vinculado por estos Términos. Si no estás de acuerdo con
        estos Términos, no deberías usar la Aplicación. 1. Registro y Creación
        de Cuenta 1.1. Para utilizar nuestra Aplicación, deberás completar el
        proceso de registro proporcionando información precisa, completa y
        actualizada, incluyendo tu nombre, apellido, correo electrónico,
        teléfono, género y fecha de nacimiento. 1.2. Eres responsable de
        garantizar que toda la información proporcionada sea válida. El
        suministro de información falsa podría resultar en la suspensión o
        cancelación de tu cuenta. 1.3. Al registrarte, confirmas que tienes al
        menos 18 años de edad o que cuentas con el consentimiento de un tutor
        legal para usar la Aplicación. 2. Uso de la Aplicación 2.1. La
        Aplicación está diseñada para recopilar y gestionar información
        proporcionada por los usuarios con el fin de personalizar la experiencia
        y ofrecer servicios relevantes. 2.2. No debes usar la Aplicación para
        ningún propósito ilegal, ni interferir con el funcionamiento normal de
        la misma. 2.3. Nos reservamos el derecho de modificar, suspender o
        descontinuar cualquier función de la Aplicación en cualquier momento sin
        previo aviso. 3. Privacidad y Uso de Datos 3.1. Al registrarte,
        autorizas a la Aplicación a recopilar y procesar los siguientes datos:
        Información personal proporcionada durante el registro. Datos del
        dispositivo, como ID único, versión de Android, marca, fabricante y
        modelo del dispositivo. Información del operador móvil. 3.2. Toda la
        información recopilada será utilizada de acuerdo con nuestra Política de
        Privacidad, que puedes consultar [enlace a la política de privacidad].
        3.3. Nos comprometemos a no compartir tu información personal con
        terceros sin tu consentimiento, excepto cuando sea requerido por ley. 4.
        Aceptación de Términos y Condiciones 4.1. Para completar el proceso de
        registro, debes aceptar estos Términos y nuestra Política de Privacidad
        marcando la casilla correspondiente durante el registro. 4.2. Si no
        aceptas estos Términos, no podrás utilizar la Aplicación. 5. Límites de
        Responsabilidad 5.1. No seremos responsables de ningún daño directo,
        indirecto, incidental o consecuente derivado del uso o la imposibilidad
        de uso de la Aplicación. 5.2. No garantizamos que la Aplicación estará
        libre de errores o interrupciones, aunque nos esforzaremos por
        solucionarlos lo antes posible. 6. Modificaciones a los Términos 6.1.
        Nos reservamos el derecho de modificar estos Términos en cualquier
        momento. Notificaremos cualquier cambio significativo a través de la
        Aplicación o por otros medios razonables. 6.2. El uso continuo de la
        Aplicación después de la publicación de cambios constituye tu aceptación
        de los mismos. 7. Terminación 7.1. Podemos suspender o cancelar tu
        acceso a la Aplicación en cualquier momento si violas estos Términos o
        por cualquier otro motivo razonable. 7.2. Tú también puedes desinstalar
        la Aplicación y cesar su uso en cualquier momento. 8. Ley Aplicable y
        Jurisdicción 8.1. Estos Términos se rigen por las leyes de [tu país].
        8.2. Cualquier disputa que surja en relación con estos Términos será
        resuelta ante los tribunales competentes de [tu ciudad o país]. 9.
        Contacto Si tienes alguna pregunta o inquietud sobre estos Términos,
        puedes contactarnos en: Correo electrónico: [tu correo] Dirección: [tu
        dirección] Teléfono: [tu teléfono] Al aceptar estos Términos y continuar
        con el registro, confirmas que has leído, entendido y aceptado todas las
        disposiciones aquí descritas.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
})

export default TermsAndConditions
