// component to render the form
const renderForm = (data, index = null) => (
    <form onSubmit={(e) => handleSubmit(e, index)}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={data.formData.name}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Age"
            name="age"
            value={data.formData.age}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
        {/* manages the data input */}
        <TextField  
            fullWidth
            label="Date of Birth"
            name="Date of Birth"
            value={
                data.registrationFormData.birthDate
                ? new Date(data.registrationFormData.birthDate).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                    })
                : ''
            }
            onChange={(e) => {
                const inputDate = e.target.value;
                const [month, day, year] = inputDate.split('/');
                const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                handleChange({ target: { name: e.target.name, value: formattedDate } }, index);
            }}
            onBlur={(e) => {
                const inputDate = e.target.value;
                if (inputDate) {
                const [month, day, year] = inputDate.split('/');
                const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                handleChange({ target: { name: e.target.name, value: formattedDate } }, index);
                }
            }}
            helperText="MM/DD/YYYY"
            />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={data.formData.isMDI}
                onChange={(e) => handleChange(e, index)}
                name="isMDI"
              />
            }
            label="MDI or Pump?"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Model/Brand of Pump"
            name="pumpModelBrand"
            value={data.formData.pumpModelBrand}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={data.formData.isCGM}
                onChange={(e) => handleChange(e, index)}
                name="isCGM"
              />
            }
            label="On CGM?"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Model/Brand of CGM"
            name="cgmModelBrand"
            value={data.formData.cgmModelBrand}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
            <Box border={1} borderColor="grey.300" p={1} borderRadius={2}>
                <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                    fullWidth
                    label="Legal Guardian"
                    name="legalGuardian"
                    value={data.formData.legalGuardian}
                    onChange={(e) => handleChange(e, index)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                    fullWidth
                    label="Contact Phone#"
                    name="contactPhone"
                    value={data.formData.contactPhone}
                    onChange={(e) => handleChange(e, index)}
                    />
                </Grid>
                </Grid>
            </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Primary Care Physician"
            name="Physician"
            value={data.formData.primaryCarePhysician}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            label="Diabetes Physician"
            name="Physician"
            value={data.formData.diabetesPhysician}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            label="Office Phone Number"
            name="officePhoneNumber"
            value={data.formData.officePhoneNumber}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Carbs for Breakfast"
            name="carbsBreakfast"
            value={data.formData.carbsBreakfast}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Carbs for Lunch"
            name="carbsLunch"
            value={data.formData.carbsLunch}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Carbs for Dinner"
            name="carbsDinner"
            value={data.formData.carbsDinner}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mealtime Restrictions"
            name="mealtimeRestrictions"
            multiline
            rows={2}
            value={data.mealtimeRestrictions}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Insulin to Carb Ratio"
            name="insulinToCarbRatio"
            value={data.insulinToCarbRatio}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Correction Factor"
            name="correctionFactor"
            value={data.correctionFactor}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Target"
            name="target"
            value={data.target}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="MDI - Type of Insulin"
            name="mdiInsulinType"
            value={data.mdiInsulinType}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Allergies"
            name="allergies"
            multiline
            rows={2}
            value={data.formData.allergies}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Other Diagnosis"
            name="otherDiagnosis"
            multiline
            rows={2}
            value={data.otherDiagnosis}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Over the Counter Medications"
            name="otcMedications"
            multiline
            rows={2}
            value={data.otcMedications}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Prescriptions (Other than Insulin)"
            name="otherPrescriptions"
            multiline
            rows={2}
            value={data.otherPrescriptions}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={data.insulinFor15gSnack}
                onChange={(e) => handleChange(e, index)}
                name="insulinFor15gSnack"
              />
            }
            label="Do you give insulin for 15g snack?"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Signs and Symptoms of Hypoglycemia"
            name="hypoglycemiaSymptoms"
            multiline
            rows={3}
            value={data.hypoglycemiaSymptoms}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={data.correctWith15gOrLess}
                onChange={(e) => handleChange(e, index)}
                name="correctWith15gOrLess"
              />
            }
            label="Do you correct with 15g or less?"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Signs and Symptoms of Hyperglycemia"
            name="hyperglycemiaSymptoms"
            multiline
            rows={3}
            value={data.hyperglycemiaSymptoms}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Best treatment for Hyperglycemia"
            name="hyperglycemiaTreatment"
            multiline
            rows={3}
            value={data.hyperglycemiaTreatment}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Best treatment for Hypoglycemia"
            name="hypoglycemiaTreatment"
            multiline
            rows={3}
            value={data.hypoglycemiaTreatment}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Are there any struggles with diabetes management that you hope to overcome at camp?"
            name="diabetesManagementStruggles"
            multiline
            rows={4}
            value={data.diabetesManagementStruggles}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Are there any foods that your child's glucose is sensitive to?"
            name="glucoseSensitiveFoods"
            multiline
            rows={4}
            value={data.glucoseSensitiveFoods}
            onChange={(e) => handleChange(e, index)}
          />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
        Submit
      </Button>
    </form>
  );