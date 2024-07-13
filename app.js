const inventory = {
    "item1": { name: "Item 1", quantity: 10, imageUrl: "item1.jpg" },
    "item2": { name: "Item 2", quantity: 5, imageUrl: "item2.jpg" }
};

let currentItem = null;
let codeReader = null;

async function startScanning() {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('scanner-page').style.display = 'block';

    if (!codeReader) {
        codeReader = new ZXing.BrowserQRCodeReader();
    }

    try {
        const videoInputDevices = await codeReader.getVideoInputDevices();
        if (videoInputDevices.length > 0) {
            const firstDeviceId = videoInputDevices[0].deviceId;
            await codeReader.decodeFromVideoDevice(firstDeviceId, 'scanner', (result, err) => {
                if (result) {
                    handleQRCode(result.text);
                }
                if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.error(err);
                }
            });
        } else {
            alert('No video input devices found');
            cancelScanning();
        }
    } catch (err) {
        console.error('Error accessing video input devices:', err);
        alert('Error accessing video input devices. Please ensure you have granted camera permissions.');
        cancelScanning();
    }
}

function handleQRCode(text) {
    currentItem = inventory[text];
    if (currentItem) {
        document.getElementById('scanner-page').style.display = 'none';
        document.getElementById('item-details').style.display = 'block';
        document.getElementById('item-image').src = currentItem.imageUrl;
        document.getElementById('item-name').textContent = currentItem.name;
        document.getElementById('item-quantity').textContent = `Quantity: ${currentItem.quantity}`;
    } else {
        alert('Item not found in inventory');
        cancelScanning();
    }
}

function sellItem() {
    const amount = parseInt(document.getElementById('sell-amount').value);
    if (currentItem && !isNaN(amount) && amount > 0) {
        if (amount <= currentItem.quantity) {
            currentItem.quantity -= amount;
            document.getElementById('item-quantity').textContent = `Quantity: ${currentItem.quantity}`;
        } else {
            alert('Not enough items in inventory');
        }
    } else {
        alert('Invalid amount');
    }
}

function cancelAction() {
    currentItem = null;
    document.getElementById('item-image').src = "";
    document.getElementById('item-name').textContent = "";
    document.getElementById('item-quantity').textContent = "";
    document.getElementById('sell-amount').value = "";
    document.getElementById('item-details').style.display = 'none';
    document.getElementById('home-page').style.display = 'block';
}

function cancelScanning() {
    document.getElementById('scanner-page').style.display = 'none';
    document.getElementById('home-page').style.display = 'block';
    if (codeReader) {
        codeReader.reset();
    }
}
