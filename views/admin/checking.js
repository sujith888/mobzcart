
postEditAddProduct: (req, res) => {
    console.log(req.files);
    const images = [];
    let editedImages={};
    const fileOrder = ['image1', 'image2', 'image3', 'image4'];
    fileOrder.forEach((key) => {
      if (req.files[key]) {
        editedImages[key] = req.files[key];
      }
    });
    console.log('edited image');
    console.log(editedImages);
    if(!req.files[key]){
      fileOrder.forEach((key) => {
        if (req.files[key]) {
      editedImages[key]=[{ fieldname: req.body.key,
      originalname:req.body[key],
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: 'public/uploads',
      filename: req.body[key],
      path: `public\\uploads\\${req.body[key]}`,}]
    }
  })
}  
  console.log(editedImages);
    if (editedImages) {
      Object.keys(editedImages).forEach((key) => {
        if (Array.isArray(editedImages[key])) {
          editedImages[key]?.forEach((file) => {
            images.push(file.filename);
          });
        } else {
          images.push(editedImages[key]?.filename);
        }
      });
    }
    adminProductHelpers.postEditProduct(req.query.edit, req.body, images)
      .then(() => {
        res.redirect('/admin/view_product');
      })
      .catch((err) => {
        res.status(500).send('Internal server error');
      });
  }

