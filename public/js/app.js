// Tab Management
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Email Form - Toggle recipient type
document.querySelectorAll('input[name="email-recipient-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const bpGroup = document.getElementById('email-bp-group');
        const directGroup = document.getElementById('email-direct-group');

        if (e.target.value === 'bp') {
            bpGroup.style.display = 'block';
            directGroup.style.display = 'none';
        } else {
            bpGroup.style.display = 'none';
            directGroup.style.display = 'block';
        }
    });
});

// Email Form - Toggle message format
document.querySelectorAll('input[name="email-format"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const textGroup = document.getElementById('email-text-group');
        const htmlGroup = document.getElementById('email-html-group');

        if (e.target.value === 'text') {
            textGroup.style.display = 'block';
            htmlGroup.style.display = 'none';
        } else {
            textGroup.style.display = 'none';
            htmlGroup.style.display = 'block';
        }
    });
});

// SMS Form - Toggle recipient type
document.querySelectorAll('input[name="sms-recipient-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const bpGroup = document.getElementById('sms-bp-group');
        const directGroup = document.getElementById('sms-direct-group');

        if (e.target.value === 'bp') {
            bpGroup.style.display = 'block';
            directGroup.style.display = 'none';
        } else {
            bpGroup.style.display = 'none';
            directGroup.style.display = 'block';
        }
    });
});

// SMS Character Counter
const smsMessage = document.getElementById('sms-message');
const charCount = document.getElementById('sms-char-count');

smsMessage.addEventListener('input', () => {
    const length = smsMessage.value.length;
    charCount.textContent = `${length}/160`;

    if (length > 140) {
        charCount.style.color = '#dc3545';
    } else {
        charCount.style.color = '#999';
    }
});

// Email Form Submit
document.getElementById('email-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const recipientType = document.querySelector('input[name="email-recipient-type"]:checked').value;
    const format = document.querySelector('input[name="email-format"]:checked').value;
    const subject = document.getElementById('email-subject').value;

    const payload = {
        subject: subject
    };

    if (recipientType === 'bp') {
        const bpCode = document.getElementById('email-bp-code').value.trim();
        if (!bpCode) {
            showNotification('Error', 'Ingresa un código de Business Partner', 'error');
            return;
        }
        payload.businessPartnerCode = bpCode;
    } else {
        const email = document.getElementById('email-to').value.trim();
        if (!email) {
            showNotification('Error', 'Ingresa un email destinatario', 'error');
            return;
        }
        payload.to = email;
    }

    if (format === 'text') {
        const text = document.getElementById('email-text').value;
        if (!text) {
            showNotification('Error', 'Ingresa el contenido del mensaje', 'error');
            return;
        }
        payload.text = text;
    } else {
        const html = document.getElementById('email-html').value;
        if (!html) {
            showNotification('Error', 'Ingresa el contenido HTML', 'error');
            return;
        }
        payload.html = html;
    }

    await sendRequest('/api/email', payload, 'Email', e.target);
});

// SMS Form Submit
document.getElementById('sms-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const recipientType = document.querySelector('input[name="sms-recipient-type"]:checked').value;
    const message = document.getElementById('sms-message').value.trim();

    if (!message) {
        showNotification('Error', 'Ingresa el mensaje SMS', 'error');
        return;
    }

    const payload = {
        message: message
    };

    if (recipientType === 'bp') {
        const bpCode = document.getElementById('sms-bp-code').value.trim();
        if (!bpCode) {
            showNotification('Error', 'Ingresa un código de Business Partner', 'error');
            return;
        }
        payload.businessPartnerCode = bpCode;
    } else {
        const phone = document.getElementById('sms-to').value.trim();
        if (!phone) {
            showNotification('Error', 'Ingresa un número de teléfono', 'error');
            return;
        }
        payload.to = phone;
    }

    await sendRequest('/api/sms', payload, 'SMS', e.target);
});

// Document Form Submit
document.getElementById('document-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bpCode = document.getElementById('doc-bp-code').value.trim();
    const docType = document.getElementById('doc-type').value;
    const docNumber = parseInt(document.getElementById('doc-number').value);
    const includeEmail = document.getElementById('doc-include-email').checked;
    const includeSMS = document.getElementById('doc-include-sms').checked;

    if (!bpCode || !docType || !docNumber) {
        showNotification('Error', 'Completa todos los campos requeridos', 'error');
        return;
    }

    if (!includeEmail && !includeSMS) {
        showNotification('Error', 'Selecciona al menos un canal de notificación', 'error');
        return;
    }

    const payload = {
        businessPartnerCode: bpCode,
        documentType: docType,
        documentNumber: docNumber,
        includeEmail: includeEmail,
        includeSMS: includeSMS
    };

    await sendRequest('/api/document-notification', payload, 'Documento', e.target);
});

// Bulk Form Submit
document.getElementById('bulk-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bpCodesInput = document.getElementById('bulk-bp-codes').value.trim();
    const subject = document.getElementById('bulk-subject').value.trim();
    const message = document.getElementById('bulk-message').value.trim();
    const includeEmail = document.getElementById('bulk-include-email').checked;
    const includeSMS = document.getElementById('bulk-include-sms').checked;

    if (!bpCodesInput || !subject || !message) {
        showNotification('Error', 'Completa todos los campos requeridos', 'error');
        return;
    }

    if (!includeEmail && !includeSMS) {
        showNotification('Error', 'Selecciona al menos un canal de envío', 'error');
        return;
    }

    const businessPartnerCodes = bpCodesInput
        .split(',')
        .map(code => code.trim())
        .filter(code => code.length > 0);

    if (businessPartnerCodes.length === 0) {
        showNotification('Error', 'Ingresa al menos un código de Business Partner', 'error');
        return;
    }

    const payload = {
        businessPartnerCodes: businessPartnerCodes,
        subject: subject,
        message: message,
        includeEmail: includeEmail,
        includeSMS: includeSMS
    };

    await sendRequest('/api/bulk-notifications', payload, 'Envío Masivo', e.target);
});

// Generic request sender
async function sendRequest(endpoint, payload, type, form) {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.classList.add('loading');

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('¡Éxito!', data.message || `${type} enviado correctamente`, 'success');
            addToHistory(type, payload, data, true);
            form.reset();

            // Reset radio buttons to default
            const firstRadio = form.querySelector('input[type="radio"]');
            if (firstRadio) {
                firstRadio.checked = true;
                firstRadio.dispatchEvent(new Event('change'));
            }

            // Reset checkboxes to default
            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((cb, index) => {
                if (index === 0) cb.checked = true;
            });
        } else {
            showNotification('Error', data.error || `No se pudo enviar ${type}`, 'error');
            addToHistory(type, payload, data, false);
        }
    } catch (error) {
        showNotification('Error', `Error de conexión: ${error.message}`, 'error');
        addToHistory(type, payload, { error: error.message }, false);
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
}

// Notification system
function showNotification(title, message, type = 'info') {
    const notificationArea = document.getElementById('notification-area');

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;

    notificationArea.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// History management
function addToHistory(type, payload, response, success) {
    const history = getHistory();

    const item = {
        type: type,
        payload: payload,
        response: response,
        success: success,
        timestamp: new Date().toISOString()
    };

    history.unshift(item);

    // Keep only last 50 items
    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem('sapNotificationHistory', JSON.stringify(history));
    renderHistory();
}

function getHistory() {
    const historyStr = localStorage.getItem('sapNotificationHistory');
    return historyStr ? JSON.parse(historyStr) : [];
}

function clearHistory() {
    if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
        localStorage.removeItem('sapNotificationHistory');
        renderHistory();
        showNotification('Historial Limpiado', 'Se ha eliminado todo el historial', 'info');
    }
}

function renderHistory() {
    const history = getHistory();
    const historyList = document.getElementById('history-list');

    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No hay envíos registrados aún.</p>';
        return;
    }

    historyList.innerHTML = history.map(item => {
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let details = '';
        if (item.payload.businessPartnerCode) {
            details = `BP: ${item.payload.businessPartnerCode}`;
        } else if (item.payload.to) {
            details = `A: ${item.payload.to}`;
        } else if (item.payload.businessPartnerCodes) {
            details = `${item.payload.businessPartnerCodes.length} destinatarios`;
        }

        if (item.payload.subject) {
            details += ` - ${item.payload.subject}`;
        }

        const statusMsg = item.success
            ? (item.response.message || 'Enviado correctamente')
            : (item.response.error || 'Error en el envío');

        return `
            <div class="history-item ${item.success ? 'success' : 'error'}">
                <div class="history-item-header">
                    <span class="history-item-type">${item.type}</span>
                    <span class="history-item-time">${timeStr}</span>
                </div>
                <div class="history-item-details">
                    ${details}<br>
                    <strong>Estado:</strong> ${statusMsg}
                </div>
            </div>
        `;
    }).join('');
}

// Initialize history on page load
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
});
