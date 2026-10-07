// Report New Issue Logic
document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth(['citizen']);
  if (!user) return;

  const form = document.getElementById('complaint-form');
  const submitBtn = document.getElementById('submit-btn');
  const locBtn = document.getElementById('detect-loc-btn');

  const fileInput = document.getElementById('image-input');
  const dropzone = document.getElementById('dropzone');
  const previewImg = document.getElementById('preview-img');
  const removeImgBtn = document.getElementById('remove-img-btn');
  const dropzonePlaceholder = document.getElementById('dropzone-placeholder');

  let selectedFile = null;

  // File handling
  function setFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    selectedFile = file;
    const url = URL.createObjectURL(file);
    previewImg.src = url;
    dropzone.classList.add('has-image');
    dropzonePlaceholder.style.display = 'none';
    previewImg.style.display = 'block';
    removeImgBtn.style.display = 'flex';
  }

  function clearFile() {
    selectedFile = null;
    fileInput.value = '';
    previewImg.src = '';
    dropzone.classList.remove('has-image');
    dropzonePlaceholder.style.display = 'flex';
    previewImg.style.display = 'none';
    removeImgBtn.style.display = 'none';
  }

  dropzone.addEventListener('click', (e) => {
    if (e.target !== removeImgBtn && !removeImgBtn.contains(e.target)) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  });

  removeImgBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearFile();
  });

  // Drag and drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--primary)';
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--border)';
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--border)';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  });

  // Location detection
  locBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    locBtn.disabled = true;
    locBtn.innerHTML = '<i data-feather="loader"></i> Detecting...';
    if (window.feather) feather.replace();

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        document.getElementById('lat').value = latitude.toFixed(6);
        document.getElementById('lng').value = longitude.toFixed(6);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data && data.display_name) {
            document.getElementById('address').value = data.display_name;
          }
        } catch (e) {
          // ignore reverse geocode error
        }

        locBtn.disabled = false;
        locBtn.innerHTML = '<i data-feather="map-pin"></i> Auto-detect My Location';
        if (window.feather) feather.replace();
        toast.success('Location detected!');
      },
      (err) => {
        locBtn.disabled = false;
        locBtn.innerHTML = '<i data-feather="map-pin"></i> Auto-detect My Location';
        if (window.feather) feather.replace();
        toast.error('Could not detect location. Please enter coordinates manually.');
      }
    );
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const priority = document.getElementById('priority').value;
    const ward = document.getElementById('ward').value.trim();
    const lat = document.getElementById('lat').value.trim();
    const lng = document.getElementById('lng').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!lat || !lng) {
      toast.error('Please detect or enter your location coordinates');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('priority', priority);
    formData.append('ward', ward);
    formData.append('lat', lat);
    formData.append('lng', lng);
    formData.append('address', address);

    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      await complaintService.create(formData);
      toast.success('Complaint submitted! +5 points earned 🎉');
      setTimeout(() => {
        window.location.href = '/citizen/complaints.html';
      }, 700);
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = '🚀 Submit Complaint (+5 pts)';
    }
  });

  if (window.feather) {
    window.feather.replace();
  }
});
