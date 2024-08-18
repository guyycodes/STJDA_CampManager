const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../../models');
const { config } = require('dotenv');
const { update } = require('../../models/BGTargets');
const { isAdmin } = require('../../utils/admins/validateAdmins');
config({ path: './.env' });
let userData = {};

 //     const templateParams = {
    //       email: req.body.email,
    //     };
    //     console.log(process.env.EMAILJS_PUBLIC);

        // emailjs.send('service_7098943', 'template_5grsipc', templateParams, {
        //     publicKey: process.env.EMAILJS_PUBLIC,
        //     privateKey: process.env.EMAILJS_PRIVATE, // optional, highly recommended for security reasons
        //   }).then((response) => {
        //       console.log('SUCCESS!', response.status, response.text);
        //     },
        //     (err) => {
        //       console.log('FAILED...', err);
        //     },
        //   );
// JWT setup
const jwtSecret = 'mysecretsshhhhh';
const jwtExpiration = '2h';
// name: 'Jack Black',
// [0]   age: 38,
// [0]   dateOfBirth: '1986-06-24',
// [0]   isMDI: true,
// [0]   pumpModelBrand: 'pupm123',
// [0]   isCGM: true,
// [0]   cgmModelBrand: 'cgm 456',
// [0]   legalGuardian: 'test',
// [0]   contactPhone: '3034958899',
// [0]   carbsBreakfast: '56',
// [0]   carbsLunch: '78',
// [0]   carbsDinner: '90',
// [0]   mealtimeRestrictions: 'bread',
// [0]   insulinToCarbRatio: '1:5',
// [0]   correctionFactor: '34',
// [0]   target: '99',
// [0]   mdiInsulinType: 'qwerty6',
// [0]   allergies: 'yes',
// [0]   otherDiagnosis: 'Hashimoto',
// [0]   otcMedications: 'Advil',
// [0]   otherPrescriptions: 'Penicilin',
// [0]   insulinFor15gSnack: true,
// [0]   correctWith15gOrLess: true,
// [0]   hyperglycemiaSymptoms: 'Hyperness',
// [0]   hyperglycemiaTreatment: 'sleep',
// [0]   hypoglycemiaSymptoms: 'tiredness',
// [0]   hypoglycemiaTreatment: 'excercise',
// [0]   diabetesManagementStruggles: 'confidence',
// [0]   glucoseSensitiveFoods: 'bread',
// [0]   diabetesPhysician: 'seth',
// [0]   officePhoneNumber: '1234567890',
// [0]   diagnosisDate: '2024-08-05',
// [0]   gender: 'male',
// [0]   rapidActingInsulinType: 'qwerty5',
// [0]   longActingInsulinType: 'qwerty6',
// [0]   parent1FirstName: 'Megan ',
// [0]   parent1LastName: 'Fox',
// [0]   parent1Mobile: '3034958899',
// [0]   parent2FirstName: 'Cardi',
// [0]   parent2LastName: 'B.',
// [0]   parent2Mobile: '1234567890',
// [0]   preferredLanguage: 'qwerty3',
// [0]   preferredRoommate: 'qwerty7',
// [0]   sessions: [ 'session1' ],
// [0]   specialInstructions: 'no',
// [0]   primaryCarePhysician: 'donna',
// [0]   submissionDate: '2024-08-10',
// [0]   tShirtSize: 'L',
// [0]   selectedCamps: 'Residential Camp, Robotics Camp, Science Camp, Nature Camp',
// [0]   insulinType: 'qwerty6',
// [0]   parent1Email: 'fake@test.com',
// [0]   document: null,
// [0]   signature: 'Guy Beals',
// [0]   newAccountEmail: 'guymorganb@gmail.com',
// [0]   role: 'camper'
// 'api/signup/create' endpoint
// validate their email is good and not a duplicate
router.post('/create', async (req,res)=>{
    let userData;
    let originsData;
    let careData;
    let specialNeed;
    let insulinCarbRatio;
    let overTheCounterMedication;
    let prescriptions;
    let medicalNotes;

    console.log("req.body: ",req.body)
    return res.status(200).json({ message: "Account created successfully" });

    // parse through the req.body
    if (!req.body) {
        return res.status(400).json({ message: "Bad request, no data provided" });

        
    }else if(req.body.role === 'volunteer'){
        userData = {
            // ID: null,
            FirstName: req.body.firstName,
            LastName: req.body.lastName,
            Email: req.body.email,
            Password: req.body.password,
            role: req.body.role,
            DateOfBirth: req.body.dateOfBirth,
            Phone: req.body.phone,
            Photo: req.body.profileImage,
            Notifications: req.body.notifications
        }
        try {                    
            const isAdministrator = isAdmin(userData.Email);

            console.log("isAdministrator", isAdministrator);
            
            if (isAdministrator) {
                try{
                    userData = {...userData, VolunteerType: "Admin"}
                    console.log("userData", userData);
                }catch(error){
                    console.error('Error creating admin user:', error);
                    res.status(500).send('Internal Server Error');
                }
            }
        }catch (error) {
            console.error('Error checking admin status:', error);
            res.status(500).send('Internal Server Error');
        }
    }else if(req.body.role === 'camper'){
        userData = {
            ID: null,
            Photo: req.body.profileImage,
            Email: req.body.email,
            Password: req.body.password,
            Notifications: req.body.notifications,
            Phone: req.body.phone,
            Notes: "",
            CareDataID: null,
            OriginsID: null,
            role: req.body.role,
        }
        careData = {
            CareDataID: null,
            OriginsID: null,
            CamperID: null,
            CareType: req.body.diagnosis,
            TargetBG: req.body.target,
            CorrectionFactor: req.body.correctionFactor,
            MDI: req.body.mdi || null,
            CGM: req.body.cgmModel || '',
            InsulinPump: req.body.insulinPump || null,
            InsulinPumpModel: req.body.insulinPumpModel || null,
            InsulinType: req.body.insulinType, // perscriptions
            Allergies: req.body.allergies,
            EmergencyContact: null,
        }
        originsData = {
            CamperID: null,
            FirstName: req.body.firstName || "Not Provided",
            LastName: req.body.lastName || "Not Provided",
            Gender: null,
            Age: null,
            DateOfBirth: req.body.dateOfBirth,
            Mother: null,
            Father: null,
        }
        bgTargets = {
            CareDataID: null,
            TimeLabel: null,
            BGTargetBreakfast: null,
            BGTargetLunch: null,
            BGTargetDinner: null,
            BGTargetOther: null,
        }
        insulinCarbRatio = {
            CareDataID: null,
            RatioBreakfast: req.body.InsulinToCarbRatio.Breakfast,
            RatioLunch: req.body.InsulinToCarbRatio.Lunch,
            RatioDinner: req.body.InsulinToCarbRatio.Dinner,
        }
        mealReadings = {
            CareDataID: null,
            CamperID: null,
            DateTaken: null,
            TimeLabel: null,
            UnixTime: null,
            CarbAmount: null,
            GlucoseReading: null,
            Meal: null,
            ImageIdentifier: null,
        }
        longActingInsulin = {
            CareDataID: null,
            Dosage: null,
            LastAdministered: null,
            Name: req.body.longActingInsulin,
        }
        rapidActingInsulin = {
            CareDataID: null,
            Dosage: null, 
            LastAdministered: null,
            Name: req.body.rapidActingInsulin,
        }
        specialNeed = {
            CareDataID: null,
            SpecialNeedType: req.body.specialNeeds,
            Notes: null,
            SpecialNeedInstructions: null
        }
        /////////////
        providers = {
            CareDataID: null,
            CamperID: null,
            Role: null,
            Name: null,
            Email: null,
            Phone: null
        }
        overTheCounterMedication = {
            CareDataID: null,
            CamperID: null,
            ActiveIngredients: null,
            DosageAdult: null,
            DosageChild: null,
            Instructions: null,
            SideEffects: null,
            Warnings: null,
            CreatedBy: null,
            MedicationName: req.body.overTheCounterMeds,
        }
        prescriptions = {
            CareDataID: null,
            CamperID: null,
            GenericName: null,
            Form: null,
            Dosage: null,
            Frequency: null,
            Refills: null,
            PrescribedFor: null,
            SideEffects: null,
            Interactions: null,
            PerscriptionDate: null,
            Instructions: null,
            MedicineName: req.body.prescriptions,
        }
        medicalNotes = {
            CareDataID: null,
            CamperID: null,
            NoteType: null,
            Content: null,
            Injury: null,
            CreatedBy: null,
            UpdatedBy: null,
        }
    }   
        try {
            // Check for duplicate user
            const Model = userData.role === 'camper' ? db.Camper : db.Volunteers;
           
            ///read ops check for duplicate users/////////////////////////////////////////////////////////////////////
            const duplicateUserA = await db.Camper.findOne({ where: { email: userData.Email } });
            const duplicateUserB = await db.Volunteers.findOne({
                where: { email: userData.Email },
                attributes: ['Email']  // Only select the email field
            });
            ////////////////////////////////////////////////////////////////////////////////

            if (duplicateUserA || duplicateUserB) {
                return res.redirect(409, 'http://localhost:5173/error=Conflict');
            }
            // if something weird happened...not sure why this would occur
            if (!req.body.email || !req.body.password) {
                return res.status(400).json({ message: "Email and password are required." });
            }
            // Create user either volunteer or camper
            const newUser = await Model.create(userData);
            // remove the Photo base 64 string
            const { Photo, ...jwtData } = newUser.dataValues;
            // grab the models associated with the camper
            const CamperModels = userData.role === 'camper' ? true : false;
            // if we are making a camper do this
            if (CamperModels) {
                try{
                    // links the camperModel to the care Data model using a Database hook
                    const careDataWithCamperID = {...careData};
                    const newCareData = await db.Camper.associateCamperWithCareData(userData.Email,careDataWithCamperID, 5)
                    if(!newCareData){
                        console.log('Failed to create care data');
                    }else{
                        console.log("newCareData ",newCareData)
                        console.log('Care data created successfully');
                    }
                   // Destructure needed properties from newCareData
                    const { CamperID: cpID, ID: cdID } = newCareData.dataValues;

                    // calculate campers age////////////////////////
                    const bDay = new Date(originsData.DateOfBirth);
                    console.log('bday' + bDay) // bdayThu Jun 20 2024 19:00:00 GMT-0500 (Central Daylight Time)
                    const today = new Date();
                    let age = today.getFullYear() - bDay.getFullYear();
                    const m = today.getMonth() - bDay.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < bDay.getDate())) {
                        age--;
                    }
                
                    //////////////////////////////////////////////
                    // create orgigins table for camper
                    originsData.Age = age;  // set age
                    // assigns the data to the var originsDataWithCamperID
                    const originsDataWithCamperID = {...originsData, CamperID: cpID };
                    const newOrigins = await db.OriginsData.create(originsDataWithCamperID);
                    if(!newOrigins){
                        console.log('Failed to create origins data');
                    }

                    // bg target table
                    const bgTargetWithCamperID = {...bgTargets, CareDataID: cdID}
                    const newBgTarget = await db.BGTargets.create(bgTargetWithCamperID)
                    if(!newBgTarget){
                        console.log('Failed to create bg target data');
                    }

                    // create insulin carb ratio table
                    const insulinCarbRatioWithCareDataID = {...insulinCarbRatio, CareDataID: cdID};
                    const newInsulinCarbRatio = await db.InsulinCarbRatios.create(insulinCarbRatioWithCareDataID);
                    if(!newInsulinCarbRatio){
                        console.log('Failed to create insulin carb ratio data');
                    }

                    const mealReadingsWithCarDataID = {...mealReadings, CareDataID: cdID, CamperID: cpID};
                    const newMealReadings = await db.MealReadings.create(mealReadingsWithCarDataID);
                    if(!newMealReadings){
                        console.log('Failed to create meal readings data');
                    }

                    const providersWithCareDataID = {...providers, CareDataID: cdID, CamperID: cpID};
                    const newProviders = await db.Providers.create(providersWithCareDataID);
                    if(!newProviders){
                        console.log('Failed to create providers data');
                    }

                    const prescriptionWithCareDataID = { ...prescriptions, CareDataID: cdID, CamperID: cpID };
                    const newPrescription = await db.Prescriptions.create(prescriptionWithCareDataID);
                    if(!newPrescription){
                        console.log('Failed to create providers data');
                    }

                    const overTheCounterMedicationWithCareDataID = { ...overTheCounterMedication, CareDataID: cdID, CamperID: cpID };
                    const newOverTheCounter = await db.OverTheCounterMedication.create(overTheCounterMedicationWithCareDataID);
                    if(!newOverTheCounter){
                        console.log('Failed to create over the counter medication data');
                    }
                   
                    const medicalNotesWithCareDataID = {...medicalNotes, CareDataID: cdID, CamperID: cpID};
                    const newMedicalNotes = await db.MedicalNotes.create(medicalNotesWithCareDataID);
                    if(!newMedicalNotes){
                        console.log('Failed to create medical notes data');
                    }

                    const longActingWithCareID = {...longActingInsulin, CareDataID: cdID};
                    const newLongActing = await db.LongActingInsulin.create(longActingWithCareID);
                    if(!newLongActing){
                        console.log('Failed to create long acting insulin data');
                    }

                    const rapidActingWithCareID = {...rapidActingInsulin, CareDataID: cdID};
                    const newRapidActing = await db.RapidActingInsulin.create(rapidActingWithCareID);
                    if(!newRapidActing){
                        console.log('Failed to create rapid acting insulin data');
                    }

                    // create special needs table
                    const specialNeedsWithCareDataID = {...specialNeed, CareDataID: cdID};
                    const newSpecialNeeds = await db.SpecialNeed.create(specialNeedsWithCareDataID);
                    
                    if(!newSpecialNeeds){
                        console.log('Failed to create special needs data');
                    }

                }catch(err){
                    console.log(err)
                } 
                
            } else {
                console.log('No models to search in since the role is not "camper".');
            }
            // Sign JWT
            const token = jwt.sign( jwtData, jwtSecret, { expiresIn: jwtExpiration });

            if(token){
                if(!CamperModels){ // if user is not a camper, they are a volunteer
                    res.cookie('STJDA_volunteer', token, {
                        httpOnly: false,
                        secure: false,
                        sameSite: 'Lax',
                        path: '/',
                        maxAge: 30000  // Expire after 30 seconds
                    });
                    console.log('Cookie set successfully');
                }else if(CamperModels){ // if user is not a volunteer they are a camper
                    res.cookie('STJDA_camper', token, {
                        httpOnly: false,
                        secure: false,
                        sameSite: 'Lax',
                        path: '/',
                        maxAge: 30000  // Expire after 30 seconds
                    });
                }
                console.log('Cookie set successfully');
                // Redirect after setting the cookie and sending the cookie
                res.redirect(200, 'http://localhost:5173/profile');
            }
    }catch(err){
        console.error({ message: "Error in post route: ", err });
        res.status(500).json({ message: "Server error", error: err.message });
    }
})

module.exports = router;