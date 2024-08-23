const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../../models');
const { config } = require('dotenv');
const crypto = require('crypto');
const emailjs = require('@emailjs/nodejs');
const { update } = require('../../models/BGTargets');
const { isAdmin } = require('../../utils/admins/validateAdmins');
config({ path: './.env' });


// JWT setup
const jwtSecret = 'mysecretsshhhhh';
const jwtExpiration = '2h';

const jwtEmailSecret = 'mysecretsshhhhh';
const jwtEmailExpiration = '14d';

// api/signup/send-email
router.post('/send-email', async (req, res) => {
    try {
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/;
        const { newAccountEmail } = req.body;
        
        if (!emailPattern.test(newAccountEmail)) {
            return res.status(400).json({ error: "The email address provided was invalid." });
        }

        // Calculate checksum
        const checksum = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

         // Generate JWT
         const token = jwt.sign({ checksum }, jwtEmailSecret, { expiresIn: jwtEmailExpiration });

        // Construct validation link
        const validationLink = `https://yourapp.com/validate?${token}`;

        const templateParams = {
            setup_link: validationLink,
            name: req.body.legalGuardian,
            to_email: newAccountEmail,
            subject: 'Complete Your STJDA Camp Registration - Account Setup Required',
            from: "STJDA Camp Registration",
            from_email: "no-reply@stjda.org"
        };

        console.log('EMAILJS_PUBLIC:', process.env.EMAILJS_PUBLIC);

        const response = await emailjs.send(
            process.env.EMAILJS_SERVICE, 
            process.env.EMAILJS_TEMPLATE, 
            templateParams, 
            {
                publicKey: process.env.EMAILJS_PUBLIC,
                privateKey: process.env.EMAILJS_PRIVATE,
            }
        );

        console.log('SUCCESS!', response.status, response.text);
        return res.json({ message: "Email sent successfully.", status: 200, emailStatus: response.status});
    } catch (err) {
        console.error('FAILED...', err);
        return res.status(500).json({ error: 'Failed to send email', details: err.message });
    }
});


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