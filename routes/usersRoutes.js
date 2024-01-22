const veterinarianController = require("../controllers/pets/veterinarianController");
const diseaseConditionController = require("../controllers/pets/diseaseConditionController");
const medicamentController = require("../controllers/pets/medicamentController");
const vaccineController = require("../controllers/pets/vaccineController");
const PetsController = require("../controllers/pets/petsController");

const UsersController = require("../controllers/usersController");
const AuthController = require("../controllers/authController");
const QrController = require("../controllers/qrController");
const passport = require("passport");

const { profileUpload, vaccineUpload } = require('../middlewares/uploadImage');

module.exports = (app, upload, uploadVaccine) => {
  app.get(
    "/api/users/getAll",
    passport.authenticate("jwt", { session: false }),
    UsersController.getAll
  );

  app.post(
    "/api/person/all",
    passport.authenticate("jwt", { session: false }),
    UsersController.getAllPersons
  );

  app.post("/api/persona/addimage", profileUpload.single("file"), UsersController.uploadPersonImg );

  app.post( "/api/users/registerForm", passport.authenticate("jwt", { session: false }), UsersController.registerForm );
  app.post(
    "/api/users/getoneuser",
    UsersController.getOneUser
  );
  app.get("/api/users/retrieve", UsersController.retrieveInfo);
  app.post("/api/users/registerUser", UsersController.registerUser);
  app.post("/api/users/license", UsersController.getLicense);
  app.post(
    "/api/users/resendEmail",
    passport.authenticate("jwt", { session: false }),
    UsersController.resendEmail
  );

  app.get("/api/users/confirmation/:token", UsersController.verifyUserEmail); //Confirm email to be done
  app.post("/api/users/deleteUser", UsersController.deleteUser);
  app.post(
    "/api/users/registerContact",
    passport.authenticate("jwt", { session: false }),
    UsersController.registerContact
  );
  app.post(
    "/api/users/registerObject",
    passport.authenticate("jwt", { session: false }),
    UsersController.registerObject
  );
  // app.post('/api/users/registerMascota', passport.authenticate('jwt', {session: false}), UsersController.registerMascota);
  app.post("/api/users/deleteObject", UsersController.deleteObject);

  app.post(
    "/api/users/updateInfo",
    passport.authenticate("jwt", { session: false }),
    UsersController.updateInfo
  );
  // app.get('/api/users/verification', UsersController.verifyUserEmail);

  app.post("/api/users/login", UsersController.login);
  app.post("/api/users/bandAuth", AuthController.bandAuth);

  app.get("/api/auth/insertMed", AuthController.ingresoMedico);
  app.get("/api/auth", AuthController.getAuth);
  app.get("/api/auth/bandreq", QrController.findByCode);
  app.get("/api/auth/sendNot", QrController.sendNotification);
  app.get("/api/auth/sendpetnotification", QrController.sendPetNotification);
  app.get("/api/auth/qrCop", QrController.autenticarCop);
  app.post("/api/auth/newCode", QrController.newCode);

  // app.get('/api/qr-sh/:id_user',QuotesController.findByUser);

  // Pets 2.0 routes
  app.post(
    "/api/users/createpet",
    upload.single("file"),
    passport.authenticate("jwt", { session: false }),
    UsersController.createOrUpdatePet
  );
  app.post(
    "/api/users/getpet",
    passport.authenticate("jwt", { session: false }),
    UsersController.getPet
  );
  app.post("/api/users/existspet", UsersController.existsPet);

  app.post(
    "/api/users/updateuser",
    passport.authenticate("jwt", { session: false }),
    UsersController.updateUser
  );
  

  // ---------------------------- PETS ROUTES ------------------------------------


  app.post(
    "/api/pets/all",
    passport.authenticate("jwt", { session: false }),
    PetsController.getAllPets
  );
  app.post(
    "/api/pets/getonepet",
    passport.authenticate("jwt", { session: false }),
    PetsController.getOnePet
  );
  app.post(
    "/api/pets/getowner",
    passport.authenticate("jwt", { session: false }),
    PetsController.getOwner
  );
  app.post(
    "/api/pets/getownerxpet",
    PetsController.getOwnerxPet
  );
  app.post(
    "/api/pets/addpet",
    upload.single("file"),
    passport.authenticate("jwt", { session: false }),
    PetsController.addPet
  );
  app.post(
    "/api/pets/identifier",
    passport.authenticate("jwt", { session: false }),
    PetsController.setpetIdentifier
  );
  app.post(
    "/api/pets/updatepet",
    upload.single("file"),
    passport.authenticate("jwt", { session: false }),
    PetsController.updatePet
  );
  app.post(
    "/api/pets/deletepet",
    passport.authenticate("jwt", { session: false }),
    PetsController.deletePet
  );
  app.post("/api/pets/bandauth", AuthController.petBandAuth);
  app.post("/api/pets/gethashcode", PetsController.getHascode);
  app.post("/api/pets/agreement", PetsController.getAgreement);

  app.post(
    "/api/pets/addupdate",
    upload.single("file"),
    PetsController.createOrUpdatePet
  );

  // ---------------------------- VACCINES ROUTES ------------------------------------

  app.post(
    "/api/vaccine/all",
    passport.authenticate("jwt", { session: false }),
    vaccineController.getAll
  );
  app.post(
    "/api/vaccine/getone",
    passport.authenticate("jwt", { session: false }),
    vaccineController.getOneVaccine
  );
  app.post(
    "/api/vaccine/add",
    uploadVaccine.single("file"),
    passport.authenticate("jwt", { session: false }),
    vaccineController.addVaccine
  );
  // app.post('/api/vaccine/update',uploadVaccine.single('file'), vaccineController.updateVaccine);
  app.post(
    "/api/vaccine/delete",
    passport.authenticate("jwt", { session: false }),
    vaccineController.deleteVaccine
  );

  app.post(
    "/api/vaccine/update",
    upload.single("file"),
    passport.authenticate("jwt", { session: false }),
    vaccineController.createOrUpdate
  );

  // ---------------------------- DISEASE CONDITION ROUTES ------------------------------------

  app.post(
    "/api/disease/all",
    passport.authenticate("jwt", { session: false }),
    diseaseConditionController.getAll
  );
  app.post(
    "/api/disease/getone",
    passport.authenticate("jwt", { session: false }),
    diseaseConditionController.getOneDiseaseCondition
  );
  app.post(
    "/api/disease/add",
    passport.authenticate("jwt", { session: false }),
    diseaseConditionController.addDiseaseCondition
  );
  app.post(
    "/api/disease/update",
    passport.authenticate("jwt", { session: false }),
    diseaseConditionController.updateDiseaseCondition
  );
  app.post(
    "/api/disease/delete",
    passport.authenticate("jwt", { session: false }),
    diseaseConditionController.deleteDiseaseCondition
  );

  // ---------------------------- MEDICAMENT ROUTES ------------------------------------

  app.post(
    "/api/treatment/all",
    passport.authenticate("jwt", { session: false }),
    medicamentController.getAll
  );
  app.post(
    "/api/treatment/getone",
    passport.authenticate("jwt", { session: false }),
    medicamentController.getOneMedicament
  );
  app.post(
    "/api/treatment/add",
    passport.authenticate("jwt", { session: false }),
    medicamentController.addMedicament
  );
  app.post(
    "/api/treatment/update",
    passport.authenticate("jwt", { session: false }),
    medicamentController.updateMedicament
  );
  app.post(
    "/api/treatment/delete",
    passport.authenticate("jwt", { session: false }),
    medicamentController.deleteMedicament
  );

  // ---------------------------- VETERINARIAN ROUTES ------------------------------------

  app.post(
    "/api/veterinarian/all",
    passport.authenticate("jwt", { session: false }),
    veterinarianController.getAll
  );

  app.post(
    "/api/veterinarian/database",
    passport.authenticate("jwt", { session: false }),
    veterinarianController.getDatabase
  );
  app.post(
    "/api/veterinarian/getone",
    passport.authenticate("jwt", { session: false }),
    veterinarianController.getOneVeterinarian
  );
  app.post(
    "/api/veterinarian/add",
    passport.authenticate("jwt", { session: false }),
    veterinarianController.addVeterinarian
  );
  app.post(
    "/api/veterinarian/update",
    passport.authenticate("jwt", { session: false }),
    veterinarianController.updateVeterinarian
  );
  app.post(
    "/api/veterinarian/delete",
    passport.authenticate("jwt", { session: false }),
    veterinarianController.deleteVeterinarian
  );

  // ---------------------------- API ROUTES ------------------------------------

  app.post(
    "/api/users/getonepet",
    passport.authenticate("jwt", { session: false }),
    UsersController.getOnePet
  );

  app.put("/api/users/forgotpassword", UsersController.forgotPassword);
  app.put(
    "/api/users/newpassword/:id/:resetToken",
    UsersController.resetPassword
  );

  app.get("/api/users/departments", UsersController.getDepartments);
  app.post("/api/users/townships", UsersController.getTownships);

  //app.post('/api/users/upload', upload.single('file'), UsersController.uploadPetImg);
};
