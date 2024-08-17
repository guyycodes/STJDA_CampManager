// Function to parse API data and put it into its respective feilds to fill out the form
export const parseApiData = (apiData) => {

    // setAllData(apiData);
    const content = Array.isArray(apiData) ? apiData[0] : apiData;

    // Function to calculate age from birthdate
    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
    };

  return {
       // API data
      name: `${content.registrationFormData.firstName} ${content.registrationFormData.lastName}`,
      age: calculateAge(content.registrationFormData.birthDate),
      dateOfBirth: content.registrationFormData.birthDate,
      isMDI: true,
      pumpModelBrand: '',
      isCGM: false,
      cgmModelBrand: '',
      legalGuardian: content.guardianName,
      contactPhone: content.registrationFormData.parent1Mobile,
      carbsBreakfast: '',
      carbsLunch: '',
      carbsDinner: '',
      mealtimeRestrictions: '',
      insulinToCarbRatio: '',
      correctionFactor: '',
      target: '',
      mdiInsulinType: content.registrationFormData.mdiInsulinType,
      allergies: content.registrationFormData.allergies,
      otherDiagnosis: '',
      otcMedications: '',
      otherPrescriptions: '',
      insulinFor15gSnack: false,
      hypoglycemiaSymptoms: '',
      correctWith15gOrLess: false,
      hyperglycemiaSymptoms: '',
      hyperglycemiaTreatment: '',
      hypoglycemiaTreatment: '',
      diabetesManagementStruggles: '',
      glucoseSensitiveFoods: '',
      rapidActingInsulinType: '', 
      longActingInsulinType: '',
      //
      diabetesPhysician: content.registrationFormData.diabetesPhysician,
      primaryCarePhysician: content.registrationFormData.primaryCarePhysician,
      officePhoneNumber: content.registrationFormData.officePhoneNumber,
      diagnosisDate: content.registrationFormData.diagnosisDate,
      gender: content.registrationFormData.gender,
      insulinType: content.registrationFormData.insulinType,
      parent1Email: content.registrationFormData.parent1Email,
      parent1FirstName: content.registrationFormData.parent1FirstName,
      parent1LastName: content.registrationFormData.parent1LastName,
      parent1Mobile: content.registrationFormData.parent1Mobile,
      parent2FirstName: content.registrationFormData.parent2FirstName,
      parent2LastName: content.registrationFormData.parent2LastName,
      parent2Mobile: content.registrationFormData.parent2Mobile,
      preferredLanguage: content.registrationFormData.preferredLanguage,
      preferredRoommate: content.registrationFormData.preferredRoommate,
      sessions: content.registrationFormData.sessions && content.registrationFormData.sessions.length > 0 
      ? [...content.registrationFormData.sessions] 
      : [],
      specialInstructions: content.registrationFormData.specialInstructions,
      submissionDate: content.registrationFormData.submissionDate,
      tShirtSize: content.registrationFormData.tShirtSize,
      selectedCamps: content.selectedCamps,
      document: null
  };
};