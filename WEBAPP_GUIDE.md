# Guía de Uso - Interfaz Web

## Introducción

La interfaz web de SAP Business One Email & SMS Sender te permite enviar notificaciones de manera fácil e intuitiva, sin necesidad de conocimientos técnicos o usar comandos de terminal.

## Acceso

Una vez que hayas iniciado el servidor, abre tu navegador web y visita:

```
http://localhost:3000/
```

## Secciones de la Interfaz

### 1. 📧 Enviar Email

Esta sección te permite enviar emails individuales.

**Pasos:**

1. **Selecciona el tipo de destinatario:**
   - **Business Partner**: Busca automáticamente el email del cliente en SAP
   - **Email Directo**: Envía a un email específico

2. **Ingresa el destinatario:**
   - Si seleccionaste Business Partner, ingresa el código (ej: C00001)
   - Si seleccionaste Email Directo, ingresa el email (ej: cliente@ejemplo.com)

3. **Escribe el asunto:**
   - Ingresa el asunto del email (obligatorio)

4. **Selecciona el formato:**
   - **Texto Plano**: Para mensajes simples
   - **HTML**: Para mensajes con formato (negritas, colores, imágenes, etc.)

5. **Escribe el mensaje:**
   - Ingresa tu mensaje en el área de texto correspondiente

6. **Haz clic en "Enviar Email"**

**Ejemplo de uso:**
- Código BP: C00001
- Asunto: "Confirmación de Pedido"
- Mensaje: "Su pedido ha sido confirmado y será procesado en las próximas 24 horas."

### 2. 📱 Enviar SMS

Esta sección te permite enviar SMS individuales.

**Pasos:**

1. **Selecciona el tipo de destinatario:**
   - **Business Partner**: Busca automáticamente el teléfono del cliente en SAP
   - **Teléfono Directo**: Envía a un número específico

2. **Ingresa el destinatario:**
   - Si seleccionaste Business Partner, ingresa el código (ej: C00001)
   - Si seleccionaste Teléfono Directo, ingresa el número (ej: +56912345678)

3. **Escribe el mensaje:**
   - Máximo 160 caracteres
   - Un contador te muestra cuántos caracteres has usado

4. **Haz clic en "Enviar SMS"**

**Ejemplo de uso:**
- Código BP: C00001
- Mensaje: "Su pedido #12345 ha sido despachado y llegará en 2-3 días hábiles. ¡Gracias!"

**Nota:** Para que funcione el SMS, debes tener configurada una cuenta de Twilio en el archivo `.env`

### 3. 📄 Notificación de Documento

Esta sección envía notificaciones automáticas basadas en documentos de SAP (Facturas, Órdenes, etc.).

**Pasos:**

1. **Ingresa el Código Business Partner:**
   - Ej: C00001

2. **Selecciona el Tipo de Documento:**
   - **Factura (Invoice)**: Para enviar facturas
   - **Orden (Order)**: Para confirmar órdenes
   - **Cotización (Quotation)**: Para enviar cotizaciones
   - **Nota de Entrega (DeliveryNote)**: Para avisar despachos

3. **Ingresa el Número de Documento:**
   - Este es el número interno del documento en SAP (DocEntry)
   - Ej: 123

4. **Selecciona los canales:**
   - ✅ Enviar Email: Envía un email formateado con los datos del documento
   - ✅ Enviar SMS: Envía un SMS de notificación

5. **Haz clic en "Enviar Notificación"**

**Ejemplo de uso:**
- Código BP: C00001
- Tipo: Factura (Invoice)
- Número: 1523
- Canales: Email ✅, SMS ✅

El sistema automáticamente:
- Obtiene los datos del documento desde SAP
- Obtiene el email y teléfono del Business Partner
- Crea un email formateado profesionalmente con los detalles
- Envía un SMS de notificación breve

### 4. 📨 Envío Masivo

Esta sección te permite enviar el mismo mensaje a múltiples Business Partners a la vez.

**Pasos:**

1. **Ingresa los Códigos Business Partner:**
   - Escribe los códigos separados por comas
   - Ej: C00001, C00002, C00003, C00004

2. **Escribe el Asunto:**
   - El asunto del email (si envías email)

3. **Escribe el Mensaje:**
   - El contenido que se enviará a todos

4. **Selecciona los canales:**
   - ✅ Enviar Email: Envía por email
   - ✅ Enviar SMS: Envía por SMS

5. **Haz clic en "Enviar a Todos"**

**Ejemplo de uso - Campaña de Marketing:**
- Códigos: C00001, C00002, C00003, C00004, C00005
- Asunto: "Promoción Especial de Verano"
- Mensaje: "¡Aprovecha nuestras ofertas de verano! 30% de descuento en productos seleccionados. Válido hasta fin de mes."
- Canal: Solo Email ✅

**Ejemplo de uso - Aviso Urgente:**
- Códigos: C00001, C00002
- Asunto: "Cierre por Mantenimiento"
- Mensaje: "Les informamos que el día sábado estaremos cerrados por mantenimiento de 14:00 a 16:00 hrs."
- Canales: Email ✅, SMS ✅

### 5. 📊 Historial

Esta sección muestra un registro de todas las notificaciones enviadas.

**Características:**

- **Vista cronológica**: Los envíos más recientes aparecen primero
- **Códigos de color**:
  - Verde: Envío exitoso ✅
  - Rojo: Error en el envío ❌
- **Información mostrada**:
  - Tipo de envío (Email, SMS, Documento, etc.)
  - Destinatario
  - Fecha y hora
  - Estado del envío
- **Persistencia**: El historial se guarda en el navegador (localStorage)
- **Limpiar**: Puedes eliminar todo el historial con el botón "Limpiar Historial"

## Notificaciones en Pantalla

Cuando realizas una acción, aparecerá una notificación en la esquina superior derecha con el resultado:

- **✅ Verde**: Acción exitosa
- **❌ Rojo**: Error (revisa el mensaje para más detalles)
- **ℹ️ Azul**: Información general

Las notificaciones desaparecen automáticamente después de 5 segundos.

## Tips y Mejores Prácticas

### Para Emails:

1. **Usa HTML para emails importantes**: Los emails HTML se ven más profesionales
2. **Prueba primero**: Envía un email de prueba a ti mismo antes de enviar a clientes
3. **Asuntos claros**: Usa asuntos descriptivos que expliquen el contenido

### Para SMS:

1. **Sé breve**: Los SMS tienen un límite de 160 caracteres
2. **Mensaje claro**: Ve directo al punto, sin rodeos
3. **Incluye datos importantes**: Números de orden, fechas, etc.

### Para Documentos:

1. **Verifica el número**: Asegúrate de que el DocEntry sea correcto
2. **Usa ambos canales**: Email para detalles, SMS para notificación rápida

### Para Envíos Masivos:

1. **Segmenta tu audiencia**: No envíes el mismo mensaje a todos si no es relevante
2. **Revisa los códigos**: Verifica que todos los códigos BP sean correctos
3. **Horarios apropiados**: Evita enviar SMS muy temprano o muy tarde

## Solución de Problemas

### "Business Partner no encontrado"
- Verifica que el código sea correcto
- Asegúrate de que el Business Partner existe en SAP
- Revisa que la conexión con SAP esté activa

### "Business Partner no tiene email"
- El cliente no tiene registrado un email en SAP
- Usa la opción "Email Directo" para ingresar uno manualmente

### "SMS service is not configured"
- No has configurado Twilio en el archivo `.env`
- Verifica las credenciales de Twilio
- Puedes usar solo email si no necesitas SMS

### "Error de conexión"
- Verifica que el servidor esté corriendo
- Revisa la consola del servidor para más detalles
- Asegúrate de que la configuración de SAP sea correcta

## Seguridad

- La interfaz web es solo para uso local por defecto
- Para uso en producción, implementa autenticación
- Nunca compartas las credenciales de SAP o Twilio
- Usa HTTPS en entornos de producción

## Soporte

Si encuentras problemas o tienes preguntas, revisa:
1. Los logs del servidor (carpeta `logs/`)
2. La consola del navegador (F12 → Console)
3. El archivo README.md para configuración
4. El archivo API_DOCUMENTATION.md para detalles técnicos
