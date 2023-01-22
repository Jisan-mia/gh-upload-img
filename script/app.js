const form = document.querySelector('form');
const token = document.getElementById('token')
const user = document.getElementById('user')
const repo = document.getElementById('repo')
const submitBtn = document.getElementById('submit-btn')

const inputContainer = document.querySelector('.imginput__container')
const imgInput = document.querySelector('.img__input')

let image_name;
let image_type;

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const fileReader = new FileReader;

    fileReader.onload = function() {
      const srcData = fileReader.result;
      resolve(srcData);
    }
    fileReader.readAsDataURL(blob);
  })
}

function insertImage(src) {
  const imgElm = document.createElement('img');
  imgElm.src = src
  imgElm.classList.add('img__preview')

  document.querySelector(".img__container").innerHTML = imgElm.outerHTML;
}

function handleImageChange(e) {
  const selectedFile = e.target.files;
  console.log(selectedFile)
  if(selectedFile.length > 0) {
    const [imageFile] = selectedFile;
    blobToBase64(imageFile).then((srcData) => {
      image_name = imageFile.name;
      image_type = imageFile.type;

      insertImage(srcData)
    })
  }
}

async function uploadImageToGithub(base64Data) {
  console.log(base64Data)

  const data = {
    owner: user.value,
    repo: repo.value,
    token: token.value,
    name: image_name,
    type: image_type,
    content: base64Data
  }

  return fetch(
    `https://api.github.com/repos/${data.owner}/${data.repo}/contents/${data.name}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${data.token}`
      },
      body: JSON.stringify({
        message: 'upload image',
        content: data.content
      })
    }
  ).then(res => res.json())
}

imgInput.addEventListener('change', handleImageChange)
imgInput.addEventListener('dragend', handleImageChange)

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const selectedImg = document.querySelector('.img__preview')

  if(!selectedImg) {
    alert('Please Select an Image');

    return;
  }

  submitBtn.value = 'Loading..'
  submitBtn.style.cursor = 'wait'
  uploadImageToGithub(selectedImg.src.split('base64,')[1])
    .then(res => {
      let message=''
      if(res.message) {
        message = res.message;
      } else {
        message = `Successfully Uploaded. <br /> Source url: <a href="${res.content.html_url}">${res.content.html_url}</a> <br /> <br /> Image Url: <a href="${res.content.download_url}">${res.content.download_url}</a>`
        console.log('response', res);
      }
      document.querySelector('.log').innerHTML = message
      submitBtn.value = 'Upload to Github'
      submitBtn.style.cursor = 'pointer'
    })
    .catch(e => {
      alert('Something went wrong')
    })
})
