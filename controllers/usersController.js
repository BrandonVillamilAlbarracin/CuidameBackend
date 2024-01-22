const User = require("../models/user");
const Pet = require("../models/pets/pet");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const transporter = require("../config/mailer");
const _ = require("lodash");
const crypto = require("crypto");
const HttpStatus = require("http-status-codes");
const fs = require("fs/promises");

function generateHash(password) {
  return crypto.createHash("md5").update(password).digest("hex");
}

function compareSync(password, hash) {
  const verifyHash = generateHash(password);
  return hash === verifyHash;
}

async function getAllPersons(req, res, next) {
  try {
    const id = req.body.id;
    const persons = await User.getAllPersons(id);

    return res.status(201).json(persons);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al traer todas las personas",
    });
  }
}

async function updatePassword(req, res, next) {
  const { id, password, newPassword } = req.body;
  try {
    const user = await User.findOneUserById(id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Usuario no se encontrado.",
        error: error,
      });
    }

    const hashedPass = generateHash(password);

    const validPass = compareSync(hashedPass, user.password);

    if (!validPass) {
      return res.status(400).json({
        success: false,
        message: "La contraseña es incorrecta.",
        error: error,
      });
    }

    const hashedNewPass = generateHash(newPassword);

    const validNewPass = compareSync(hashedNewPass, user.password);

    if (validNewPass) {
      return res.status(400).json({
        success: false,
        message: "La contraseña no puede ser igual a la anterior.",
        error: error,
      });
    }

    await User.updatePassword(id, hashedNewPass);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {}
}

async function updateUser(req, res, next) {
  try {
    const info = req.body;
    console.log(info);

    const saved = await User.findOneUserById(info.id);

    if (saved) {
      const token = jwt.sign(
        { id: saved.id, email: saved.email },
        keys.secretOrKey,
        {
          //    expiresIn: (60*60*24)
        }
      );

      const data = {
        id: saved.id,
        hashcode: saved.hashcode,
        name: saved.name,
        lastname: saved.lastname,
        typeID: saved.typeid,
        numberID: saved.numberid,
        email: saved.email,
        phone: saved.phone,
        session_token: `JWT ${token}`,
      };

      await User.updateUser(info);

      return res.status(201).json({
        success: true,
        message: "Actualización exitosa.",
        data: data,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "No existe el usuario",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      success: false,
      message: "Hubo un error con la actualización del usuario.",
      error: error,
    });
  }
}

async function getOneUser(req, res, next) {
  try {
    const id = req.body.id;
    const user = await User.getUserById(id);
    return res.status(201).json(user);
  } catch (error) {
    console.log(`Error: ${error}`);
    return res.status(501).json({
      success: false,
      message: "Error al obtener el usuario.",
    });
  }
}

async function getPetnUser(req, res) {
  try {
    const hashcode = req.body.hashcode;
    const petnUser = User.getPetnUser(hashcode);
    return res.status(201).json(petnUser);
  } catch (error) {
    req
      .status(501)
      .json({ success: false, message: "Error al obtener la información" });
  }
}

async function getOnePet(req, res, next) {
  try {
    const id = req.body.id_usuario;
    console.log(id);
    const pet = await User.findMascotaById(id);
    return res.status(201).json(pet);
  } catch (error) {
    console.log(`Error: ${error}`);
    return res.status(501).json({
      success: false,
      message: "Error al obtener la mascota.",
    });
  }
}

async function uploadPetImg(req) {
  const file = req.file;
  if (!file) {
    return {
      success: false,
      message: "No hay archivos",
    };
  }

  const imagePath = file.path;
  const imageName = file.filename;

  return {
    success: true,
    message: "Imagen Cargada",
    imagePath,
    imageName,
  };
}

async function uploadPersonImg(req, res) {
  try {
    const id = req.body.id;
    const data = {
      id: req.body.id,
    };
    const file = req.file;
    const pacient = await User.findPacientById(id);

    if (file) {
      data.photoUrl = file.path;
    } else {
      data.photoUrl = pacient.photourl;
    }

    if (pacient) {
      if (file){
        if (pacient.photourl !== data.photoUrl) {
          try {
            await fs.unlink(pacient.photourl);
          } catch (error) {
            console.error("Error al eliminar la imagen anterior:", error);
          }
        }
      }
      await User.savePhotoUrl(data);

      return res.status(200).json({
        success: true,
        message: "Imagen cargada.",
      });
    } else {
      return res.status(404).json({
        success: true,
        message: "Error al cargar imagen.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      success: true,
      message: "Error al cargar la imagen.",
    });
  }
}

async function createOrUpdatePet(req, res, next) {
  try {
    const petinfo = req.body;
    const imageFile = req.file;
    console.log(petinfo);
    // console.log(imageFile);
    if (imageFile) {
      petinfo.photoUrl = imageFile.path;
      petinfo.photoName = imageFile.filename;
    }

    const savedPet = await User.findMascotaById(petinfo.id_usuario);

    if (!savedPet) {
      // console.log(petinfo.photourl, petinfo.photoname);
      await User.createMascota(petinfo);
      return res.status(201).json({
        success: true,
        message: "Se ha guardado la información de tu mascota correctamente.",
      });
    } else {
      if (imageFile) {
        petinfo.photourl = imageFile.path;
        petinfo.photoname = imageFile.filename;

        // console.log("saved image", savedPet.photourl);
        // console.log("New image", petinfo.photourl);

        if (savedPet.photourl !== petinfo.photoUrl) {
          try {
            await fs.unlink(savedPet.photourl);
          } catch (error) {
            console.error("Error al eliminar la imagen anterior:", error);
          }
        }
      }
      await User.updatePet(petinfo);

      return res.status(201).json({
        success: true,
        message:
          "Actualización exitosa. Los cambios se veran reflejados al iniciar sesión.",
      });
    }
  } catch (error) {
    console.log(`Error: ${error}`);
    return res.status(501).json({
      success: false,
      message: "Hubo un error con el registro de tu mascota.",
      error: error,
    });
  }
}

module.exports = {
  uploadPetImg,
  createOrUpdatePet,
  getOnePet,
  getPetnUser,
  getOneUser,
  updateUser,
  getAllPersons,
  uploadPersonImg,

  async forgotPassword(req, res) {
    try {
      const email = req.body.email;
      const myUser = await User.findByEmail(email);

      if (!myUser) {
        return res.status(404).json({
          success: false,
          message: "El correo electrónico no está registrado",
        });
      }

      // Generar token para recuperación de contraseña
      const resetLink = jwt.sign(
        { id: myUser.id, email: myUser.email },
        keys.secretOrKey,
        { expiresIn: "20m" }
      );

      const url = `https://app.cuidame.tech/#/newpassword/${myUser.id}/${resetLink}`;
      await transporter.sendMail({
        to: myUser.email,
        subject: "Recuperación de Contraseña",
        html: `Hola ${myUser.name}, para recuperar tu contraseña haz click en el siguiente enlace: <a href="${url}">Enlace de recuperación</a>. Este enlace expira en 20 minutos.`,
      });

      console.log(url);

      return res.status(200).json({
        success: true,
        message: "Se ha enviado un correo de recuperación de contraseña",
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(500).json({
        success: false,
        message: "Error al generar el correo de recuperación",
        error: error,
      });
    }
  },

  async resetPassword(req, res) {
    try {
      const id = req.params.id;
      const resetToken = req.params.resetToken;
      const newPassword = req.body.newPassword;
      console.log(newPassword);

      // Verificar si el token es válido y obtener el usuario
      const decodedToken = jwt.verify(resetToken, keys.secretOrKey);
      if (decodedToken.id !== id) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Token inválido para esta solicitud",
        });
      }

      // Obtener el usuario y verificar que existe
      const myUser = await User.findOneUserById(id);
      if (!myUser) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      // Encriptar la contraseña usando la función de hashing
      const newPasswordHashed = crypto
        .createHash("md5")
        .update(newPassword)
        .digest("hex");

      // Actualizar la contraseña del usuario
      await User.updatePassword(id, newPasswordHashed);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error("Token inválido para esta solicitud");
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Token inválido para esta solicitud",
        });
      }
      console.error(`Error: ${error}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error al actualizar la contraseña",
        error: error,
      });
    }
  },

  //   const email = req.body.email;

  //   if (email == "") {
  //     res.status(400).send({ message: "El email es requerido!" });
  //   }

  //   try {
  //     const user = await User.findByEmail(email);

  //     if (!user) {
  //       return res.status(400).send({ message: "El email no existe!" });
  //     }

  //     const token = jwt.sign({ id: user.id }, keys.emailSecret, {
  //       expiresIn: "20m",
  //     });
  //     const mailOptions = {
  //       to: user.email,
  //       subject: "Enlace para recuperar tu cuenta en Cuídame",
  //       html: `Hola ${user.name} Entendemos tu preocupación por recuperar tu cuenta, por favor para recuperar tu cuenta haz click en el siguiente enlace: <a href="/resetpassword/${user.id}/${token}">${url}</a><br><p>Este enlace expira pasado 20 minutos.</p>`,
  //     };

  //     transporter.sendMail(mailOptions, (err, response) => {
  //       if (err) {
  //         console.error("Ha ocurrido un error", err);
  //       } else {
  //         console.log("Response", response);
  //         res
  //           .status(200)
  //           .send("El email para la recuperación ha sido enviado.");
  //       }
  //     });
  //   } catch (e) {
  //     res.status(500).send("Ha ocurrido un error", e);
  //   }
  // },

  async getLicense(req, res, next) {
    try {
      const hashcode = req.body.hashcode;
      const license = await User.hashcode(hashcode);
      if (license === null) {
        l = "Pets";
        return res.status(201).json(l);
      }
      return res.status(201).json(license);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el tipo de licencia.",
      });
    }
  },

  async getDepartments(req, res, next) {
    try {
      const department = await User.getAllDepartments();
      return res.status(201).json(department);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los departamentos.",
      });
    }
  },

  async getTownships(req, res, next) {
    try {
      const dep_id = req.body.id;
      const townships = await User.getTownshipsDepartment(dep_id);
      return res.status(201).json(townships);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los municipios.",
      });
    }
  },

  async getAll(req, res, next) {
    try {
      const data = await User.getAll();
      // console.log(`Usuarios: ${data}`);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los usuarios",
      });
    }
  },

  async login(req, res, next) {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const notificationID = req.body.notificationID;
      const myUser = await User.findByEmail(email);
      // console.log("myuser", myUser);

      if (!myUser) {
        return res.status(401).json({
          success: false,
          message: "Usuario y/o contraseña no reconocidos", //Usuario no encontrado
        });
      }

      if (User.isPasswordMatched(password, myUser.password)) {
        const token = jwt.sign(
          { id: myUser.id, email: myUser.email },
          keys.secretOrKey,
          {
            //    expiresIn: (60*60*24)
          }
        );
        const data = {
          id: myUser.id,
          hashcode: myUser.hashcode,
          name: myUser.name,
          lastname: myUser.lastname,
          typeID: myUser.typeid,
          numberID: myUser.numberid,
          email: myUser.email,
          phone: myUser.phone,
          session_token: `JWT ${token}`,
          service: myUser.service,
          // roles: myUser.roles
        };

        if (!myUser.verificado) {
          return res.status(401).json({
            success: true,
            message: "emailnoverificado",
            data,
          });
        }

        await User.updateToken(myUser.id, `JWT ${token}`);
        await User.updateNotificationID(myUser.id, notificationID);

        // console.log(`Usuaario enviado: ` + data);

        return res.status(201).json({
          success: true,
          message: "Se ha autenticado correctamente",
          data: data,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Usuario y/o contraseña no reconocidos", //La contraseña es incorrecta
          data: {},
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al momento de hacer el login",
        error: error,
      });
    }
  },

  async registerForm(req, res, next) {
    try {
      const Info = req.body;
      const form = Number(Info.form);

      if (form == 1) {
        const { hashcode } = await User.getOneQr();

        if (Info.code === "" || Info.code == null) Info.code = hashcode;

        // console.log(Info);

        if (Info.hashcode == "") {
          return res.status(501).json({
            success: false,
            message: "No hay licencias para la persona.",
          });
        }
        console.log("Form 1:", Info);

        const exists = await User.personByHashcode(Info.code);
        if (exists) {
          return res.status(501).json({
            success: false,
            message: "Parece que existe otra persona con un código idéntico.",
          });
        }
        const data = await User.createForm1(Info);

        return res.status(201).json({
          success: true,
          message: "El formulario 1 (paciente) se realizó correctamente.",
          data: data.id,
        });
      } else if (form == 2) {
        // console.log("Form 2:", Info);
        for (const i in Info.enfermedades) {
          await User.createFormEnfermedad(
            Info.idPaciente,
            Info.enfermedades[i].enfermedad
          );
        }

        await User.createForm2(Info);

        return res.status(201).json({
          success: true,
          message:
            "El formulario 2 (condicion) y la enfermedad se realizó correctamente.",
        });
      } else if (form == 3) {
        // console.log("Form 3:", Info);
        const antecedentes = Info.antecedentes;
        antecedentes.forEach(async (element) => {
          await User.createForm3({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });
        return res.status(201).json({
          success: true,
          message: "El formulario 3 (antecedentes) se realizó correctamente.",
        });
      } else if (form == 6) {
        // console.log("Form 6:", Info);
        const antecedentesF = Info.antecedentesF;
        antecedentesF.forEach(async (element) => {
          await User.createForm6({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });
        return res.status(201).json({
          success: true,
          message:
            "El formulario 6 (antecedentes fam) se realizó correctamente.",
        });
      } else if (form == 4) {
        // console.log("Form 4:", Info);

        const medicamentos = Info.medicamentos;
        medicamentos.forEach(async (element) => {
          await User.createForm4({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });
        return res.status(201).json({
          success: true,
          message: "El formulario 4 (medicamentos) se realizó correctamente.",
        });
      } else if (form == 5) {
        // console.log("Form 5:", Info);
        const alergias = Info.alergias;
        alergias.forEach(async (element) => {
          await User.createForm5({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });

        return res.status(201).json({
          success: true,
          message: "El formulario 5 (alergias) se realizó correctamente.",
        });
      } else if (form == 7) {
        // console.log("Form 7:", Info);
        const vacunas = Info.vacunas;
        vacunas.forEach(async (element) => {
          await User.createFormVacunas({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });

        return res.status(201).json({
          success: true,
          message: "El formulario 7 (vacunas) se realizó correctamente.",
        });
      }
    } catch (error) {
      console.log(`Error creating: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro de la información.",
        error: error,
      });
    }
  },

  async registerContact(req, res, next) {
    try {
      const contacts = req.body;

      const savedContacts = await User.findContactsById(contacts.idUsuario);
      if (!savedContacts) {
        await User.createContact(contacts);
        return res.status(201).json({
          success: true,
          message: "Se ha guardado la información de contactos correctamente.",
        });
      } else {
        await User.updateContact(contacts);
        return res.status(201).json({
          success: true,
          message:
            "Se ha actualizado la información de contactos correctamente.",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro de los contactos.",
        error: error,
      });
    }
  },

  async registerObject(req, res, next) {
    try {
      const info = req.body;

      // const savedOBjects = await User.findContactsById(info.idUsuario);
      if (true) {
        await User.createObject(info);
        return res.status(201).json({
          success: true,
          message: "Se ha guardado la información de objetos correctamente.",
        });
      } else {
        await User.updateContact(contacts);
        return res.status(201).json({
          success: true,
          message: "Se ha actualizado la información de objetos correctamente.",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro de los contactos.",
        error: error,
      });
    }
  },

  async registerUser(req, res, next) {
    try {
      const user = req.body;
      const code = req.body.code;
      console.log("req", req.body);
      const usuarioExiste = await User.findByEmail(user.email);

      if (usuarioExiste) {
        return res.status(501).json({
          success: false,
          message: "El usuario ya se encuentra registrado en el sistema.",
        });
      }

      const data = await User.create(user);
      const id = parseInt(data);
      //Creamos un contactos por defecto
      await User.createContact({
        idUsuario: data.id,
        nombre1: user.name,
        telefono1: user.phone,
      });

      if (code != "") {
        let toBas4 = Buffer.from(code).toString("base64");
        const charToReplace = ["=", "%", "?", "/", "+"];
        charToReplace.forEach((x, i) => {
          toBas4 = toBas4.replaceAll(x, "");
        });
        await User.updateHashCode(toBas4, code);
      }

      try {
        const emailToken = jwt.sign(
          {
            user: data.id,
          },
          keys.emailSecret,
          {
            expiresIn: "1d",
          }
        );

        const url = `https://api.cuidame.tech/api/users/confirmation/${emailToken}`;
        await transporter.sendMail({
          to: user.email,
          subject: "¡Confirmación email Cuidame!",
          html: `Hola ${user.name} Gracias por adquirir nuestros servicios, por favor para confirmar tu email haz click en el siguiente enlace: <a href="${url}">${url}</a><br><p>Este enlace expira pasadas 24 horas, en ese caso por favor inicie sesión para recibir un nuevo correo de verificación.</p>`,
        });
      } catch (e) {
        console.log(e);
      }

      return res.status(201).json({
        success: true,
        message: "Se ha guardado la informacion correctamente.",
        data: data.id,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro del usuario.",
        error: error,
      });
    }
  },

  async verifyUserEmail(req, res, next) {
    //CREADNO FUNCION DONDE GENERAREMOS EMAIL Y JWT PARA EMAIL.
    try {
      const token = req.params.token;

      const tokenInfo = jwt.verify(token, keys.emailSecret);

      const resp = await User.confirmEmail(tokenInfo.user);

      return res.send(
        "Confirmación exitosa: !Muchas gracias por registrarte! Por favor, accede a la aplicación"
      );

      return res.status(401).json({
        success: true,
        message: "Se ha confirmado el email de usuario correctamente.",
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro del usuario.",
        error: error,
      });
    }
  },

  async deleteObject(req, res, next) {
    try {
      const hashcode = req.body.hashcode;
      const object = req.body.objeto;
      console.log("conchita", hashcode, object);
      await User.deleteObject(hashcode, object);
      // await Rol.create(data.id, 1); //Estableciedo rol por defecto (cliente)
      return res.status(201).json({
        success: true,
        message: "Se ha eliminado su cuenta de usuario y su información.",
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el procedimiento.",
        error: error,
      });
    }
  },

  async deleteUser(req, res, next) {
    try {
      const email = req.body.email;

      await User.deleteUser(email);
      // await Rol.create(data.id, 1); //Estableciedo rol por defecto (cliente)
      return res.status(201).json({
        success: true,
        message: "Se ha eliminado su cuenta de usuario y su información.",
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el procedimiento.",
        error: error,
      });
    }
  },

  async retrieveInfo(req, res, nect) {
    try {
      const cod = req.query.hashcode;
      const ref = req.query.ref;
      const idPaciente = req.query.id;

      console.log("debug", cod, ref, idPaciente);

      if (ref == "objetos") {
        const hashcode = req.query.hashcode;
        var data = await User.findObjectsByHashcode(hashcode);
      }

      if (ref == "mascota") {
        const hashcode = req.query.hashcode;
        var data = await User.findMascotaByHashcode(hashcode);
      }

      if (ref == "contacts") {
        const idUsuario = req.query.id;
        var data = await User.findContactsById(idUsuario);
      }

      if (ref == "paciente") {
        var data = await User.findByCod(cod);
      }
      if (ref == "usuario") {
        var data = await User.findByCod(cod);
      }
      if (ref == "user") {
        const hashcode = req.query.hashcode;
        var data = await User.findUserByHashcode(hashcode);
        console.log(data);
      }
      if (ref == "condicion") {
        const enfermedad = await User.findEnfById(idPaciente);
        console.log("enf", enfermedad);
        const enfermedadL = enfermedad.length;
        const condicion = await User.findCondById(idPaciente);
        var data = [...enfermedad, ...condicion, enfermedadL];
      }

      if (ref == "condición") {
        const enfermedad = await User.findEnfById(idPaciente);
        console.log("enf", enfermedad);
        const enfermedadL = enfermedad.length;
        const condicion = await User.findCondById(idPaciente);
        var data = [...enfermedad, ...condicion, enfermedadL];
      }

      if (ref == "antecedentes") {
        const antP = await User.findAntById(idPaciente);
        const antF = await User.findAntFById(idPaciente);
        const antPL = antP.length;
        const antFL = antF.length;
        var data = [...antP, ...antF, antPL, antFL];
      }
      if (ref == "medAlergias") {
        const med = await User.findMedById(idPaciente);
        const alergias = await User.findAlerById(idPaciente);
        const medL = med.length;
        const alergiasL = alergias.length;
        var data = [...med, ...alergias, medL, alergiasL];
      }

      if (ref == "vacunas") {
        var data = await User.findVacunasById(idPaciente);
      }

      if (!data || data.length == 0) {
        return res.status(401).json({
          success: true,
          message: "notFound",
        });
      }

      if (data.length == 0) {
        return res.status(401).json({
          success: true,
          message: "notFound",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Se ha traido la informacion correctamente",
        data: data,
      });
    } catch (error) {
      console.log(
        `Hubo un error al tratar de obtener la informacion usersController retrieveInfo${error}`
      );
      return res.status(501).json({
        message: "Hubo un error al tratar de obtener la informacion",
        error: error,
        success: false,
      });
    }
  },

  //edicion de datos por parte del usuario

  async updateInfo(req, res, next) {
    try {
      const Info = req.body;
      const form = Info.form;

      if (form == 1) {
        // console.log("Form Updated", Info);
        await User.updatePaciente(Info);
        return res.status(201).json({
          success: true,
          // message: 'El formulario 1 (paciente) se actualizó correctamente.'
          message:
            "Proceso exitoso. Los cambios se veran reflejados al iniciar sesión.",
        });
      } else if (form == 2) {
        await User.deleteInfo(Info.idPaciente, "enfermedades");
        await User.deleteInfo(Info.idPaciente, "condicion");
        for (const i in Info.enfermedades) {
          await User.createFormEnfermedad(
            Info.idPaciente,
            Info.enfermedades[i].enfermedad
          );
        }

        await User.createForm2(Info);

        return res.status(201).json({
          success: true,
          // message: 'El formulario 2 (condicion) y la enfermedad se actualizó correctamente.',
          message:
            "Proceso exitoso. Los cambios se veran reflejados al iniciar sesión.",
        });
      } else if (form == 3) {
        await User.deleteInfo(Info.idPaciente, "antecedentes");
        const antecedentes = Info.antecedentes;
        antecedentes.forEach(async (element) => {
          await User.createForm3({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });
        return res.status(201).json({
          success: true,
          // message: 'El formulario 3 (antecedentes) se actualizó correctamente.',
          message:
            "Proceso exitoso. Los cambios se veran reflejados al iniciar sesión.",
        });
      } else if (form == 6) {
        await User.deleteInfo(Info.idPaciente, "atecedentes_familiares");
        const antecedentesF = Info.antecedentesF;
        antecedentesF.forEach(async (element) => {
          await User.createForm6({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });
        return res.status(201).json({
          success: true,
          // message: 'El formulario 6 (antecedentes fam) se actualizó correctamente.',
          message:
            "Proceso exitoso. Los cambios se veran reflejados al iniciar sesión.",
        });
      } else if (form == 4) {
        await User.deleteInfo(Info.idPaciente, "medicamentos");
        const medicamentos = Info.medicamentos;
        medicamentos.forEach(async (element) => {
          await User.createForm4({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });
        return res.status(201).json({
          success: true,
          // message: 'El formulario 4 (medicamentos) se actualizó correctamente.',
          message:
            "Proceso exitoso. Los cambios se veran reflejados al iniciar sesión.",
        });
      } else if (form == 5) {
        await User.deleteInfo(Info.idPaciente, "alergias");
        const alergias = Info.alergias;
        alergias.forEach(async (element) => {
          await User.createForm5({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });
        return res.status(201).json({
          success: true,
          // message: 'El formulario 5 (alergias) se actualizó correctamente.',
          message:
            "Proceso exitoso. Los cambios se veran reflejados al iniciar sesión.",
        });
      } else if (form == 7) {
        await User.deleteInfo(Info.idPaciente, "vacunas");
        const vacunas = Info.vacunas;
        vacunas.forEach(async (element) => {
          await User.createFormVacunas({
            idPaciente: Info.idPaciente,
            ...element,
          });
        });
        return res.status(201).json({
          success: true,
          message:
            "Proceso exitoso. Los cambios se veran reflejados al iniciar sesión.",
        });
      }
    } catch (error) {
      console.log(`Error creating: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro de la información.",
        error: error,
      });
    }
  },

  async resendEmail(req, res, next) {
    const user = req.body;

    try {
      const emailToken = jwt.sign(
        {
          user: user.id,
        },
        keys.emailSecret,
        {
          expiresIn: "1d",
        }
      );

      const infoEmail = {
        user: user,
        urlToken: `https://api.cuidame.tech/api/users/confirmation/${emailToken}`,
      };

      const correoEnviado = User.sendEmail(infoEmail);

      if (correoEnviado) {
        return res.status(201).json({
          success: true,
          message: "Se reenvió el correo correctamente",
        });
      } else {
        throw "Error enviendo correo";
      }
    } catch (e) {
      console.log(e);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el envío del correo",
        error: e,
      });
    }
  },

  // ---------------------------- PETS ------------------------------------

  async getPet(req, res, next) {
    try {
      const hashcode = req.body.hashcode;
      const pet = await User.findMascotaByHashcode(hashcode);
      return res.status(201).json(pet);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener la mascota.",
      });
    }
  },

  async existsPet(req, res, next) {
    try {
      const hashcode = req.body.hashcode;
      const pet = await User.existsPetByHashcode(hashcode);
      console.log("Exists pet, ", hashcode);

      if (pet) {
        console.log("si", pet);
        return res.status(201).json(true);
      } else {
        console.log("no", pet);
        return res.status(201).json(false);
      }
    } catch (error) {
      console.error("Error:", error);
      return res.status(501).json(false);
    }
  },

  async getVaccine(req, res, next) {
    try {
      const hashcode = req.body.hashcode;
      const vaccine = await User.findPetVaccineById(hashcode);
      return res.status(201).json(vaccine);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las vacunas.",
      });
    }
  },

  async getDewormer(req, res, next) {
    try {
      const hashcode = req.body.hashcode;
      const dewormer = await User.findDewormerById(hashcode);
      return res.status(201).json(dewormer);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los desparacitantes.",
      });
    }
  },

  async getDisease(req, res, next) {
    try {
      const hashcode = req.body.hashcode;
      const disease = await User.findDiseaseById(hashcode);
      return res.status(201).json(disease);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener las enfermedades.",
      });
    }
  },

  async getSpecialCondition(req, res, next) {
    try {
      const hashcode = req.body.hashcode;
      const specialCondition = await User.findSpecialConditionById(hashcode);
      return res.status(201).json(specialCondition);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener la condición especial.",
      });
    }
  },

  async getVeterinarian(req, res, next) {
    try {
      const hashcode = req.body.hashcode;
      const veterinarian = await User.findVeterinarianById(hashcode);
      return res.status(201).json(veterinarian);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener la información del veterinario.",
      });
    }
  },

  async createPet(req, res, next) {
    try {
      const petinfo = req.body;
      console.log(petinfo);
      const savedPet = await User.findMascotaById(petinfo.id_usuario);
      if (!savedPet) {
        await User.createMascota(petinfo);
        return res.status(201).json({
          success: true,
          message: "Se ha guardado la información de tu mascota correctamente.",
        });
      } else {
        await User.updatePet(petinfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha actualizado la información de tu mascota correctamente.",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro de tu mascota.",
        error: error,
      });
    }
  },

  async createVaccine(req, res, next) {
    try {
      const vaccineInfo = req.body;
      console.log(vaccineInfo);
      const savedVaccine = await User.findPetVaccineById(vaccineInfo.hashcode);

      if (savedVaccine === null) {
        await User.createPetVaccine(vaccineInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha guardado la información de las vacunas correctamente.",
        });
      } else {
        await User.updatePetVaccine(vaccineInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha actualizado la información de las vacunas correctamente.",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro de las vacunas.",
        error: error,
      });
    }
  },

  async createDewormer(req, res, next) {
    try {
      const dewormerInfo = req.body;
      console.log(dewormerInfo);
      const savedDewormer = await User.findDewormerById(dewormerInfo.hashcode);
      if (savedDewormer == null) {
        await User.createPetDewormer(dewormerInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha guardado la información de las desparacitaciones correctamente.",
        });
      } else {
        await User.updatePetDewormer(dewormerInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha actualizado la información de las desparacitaciones correctamente.",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro de las desparacitaciones.",
        error: error,
      });
    }
  },

  async createDisease(req, res, next) {
    try {
      const diseaseInfo = req.body;
      console.log(diseaseInfo);
      const savedDisease = await User.findDiseaseById(diseaseInfo.hashcode);
      if (savedDisease == null) {
        await User.createPetDisease(diseaseInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha guardado la información de las enfermedades correctamente.",
        });
      } else {
        await User.updatePetDisease(diseaseInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha actualizado la información de las enfermedades correctamente.",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro de las enfermedades.",
        error: error,
      });
    }
  },

  async createSpecialCondition(req, res, next) {
    try {
      const sConditionInfo = req.body;
      console.log(sConditionInfo);

      const savedSpecialCondition = await User.findSpecialConditionById(
        sConditionInfo.hashcode
      );
      if (savedSpecialCondition == null) {
        await User.createPetSpecialCondition(sConditionInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha guardado la condición especial de tu mascota correctamente.",
        });
      } else {
        await User.updatePetSpecialCondition(sConditionInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha actualizado la condición especial de tu mascota correctamente.",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message:
          "Hubo un error con el registro en la condición especial de tu mascota.",
        error: error,
      });
    }
  },

  async createVeterinarian(req, res, next) {
    try {
      const veterinarianInfo = req.body;

      const savedVeterinarian = await User.findVeterinarianById(
        veterinarianInfo.hashcode
      );
      if (!savedVeterinarian) {
        await User.createPetSpecialCondition(veterinarianInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha guardado la condición especial de tu mascota correctamente.",
        });
      } else {
        await User.updatePetSpecialCondition(veterinarianInfo);
        return res.status(201).json({
          success: true,
          message:
            "Se ha actualizado la condición especial de tu mascota correctamente.",
        });
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message:
          "Hubo un error con el registro en la condición especial de tu mascota.",
        error: error,
      });
    }
  },
};
