import streamlit as st
import requests

st.set_page_config(page_title="NeuroCare AI", page_icon="🧠")
st.title("🧠 NeuroCare AI — Doctor Dashboard")

st.markdown("Enter a Patient ID to view predicted Alzheimer's risk.")

patient_id = st.number_input("Enter Patient ID", min_value=1, value=1, step=1)

if st.button("Get Prediction"):
    try:
        response = requests.post("http://127.0.0.1:8000/predict", json={"patient_id": int(patient_id)})
        if response.status_code == 200:
            data = response.json()
            st.success(f"Risk Level: {data['risk_label']}")
            st.write(f"Risk Probability: {data['risk_probability'] * 100:.2f}%")
        else:
            st.error(f"Error: {response.status_code} — {response.text}")
    except Exception as e:
        st.error(f"Connection error: {e}")
