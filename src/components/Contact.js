import React, { useRef, useState } from 'react';
import emailjs from 'emailjs-com';
import './Contact.css';

function Contact() {
  const form = useRef();
  const [submittedData, setSubmittedData] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();

    // Capture form data before sending
    const formData = {
      first_name: e.target.first_name.value,
      last_name: e.target.last_name.value,
      email: e.target.email.value,
      message: e.target.message.value,
    };

    emailjs.sendForm(
      'service_adspnyp',        // Your EmailJS Service ID
      'template_lqslq56',       // Your EmailJS Template ID
      form.current,
      'jopcebU88jioctDAz'       // Your EmailJS Public Key (User ID)
    ).then((result) => {
        console.log(result.text);
        setSubmittedData(formData); // Update state with form data
      }, (error) => {
        console.log(error.text);
        alert('Failed to send message. Please try again later.');
      });

    e.target.reset(); // Reset the form after submission
  };

  return (
    <div className="contact">
        <h1>Contact</h1>
      <h2>Please reach out to us for any questions and feedback</h2>

      {!submittedData ? (
        <form ref={form} onSubmit={sendEmail} className="contact-form">
          <div className="form-group">
            <label>First Name<span className="required">*</span></label>
            <input type="text" name="first_name" required />
          </div>
          <div className="form-group">
            <label>Last Name<span className="required">*</span></label>
            <input type="text" name="last_name" required />
          </div>
          <div className="form-group">
            <label>Email<span className="required">*</span></label>
            <input type="email" name="email" required />
          </div>
          <div className="form-group">
            <label>Message<span className="required">*</span></label>
            <textarea name="message" rows="5" required></textarea>
          </div>
          <button type="submit">Submit</button>
        </form>
      ) : (
        <div className="submission-preview">
          <h3>Thank you for your submission.</h3>
          <p>We will get back to you as soon as possible!</p>
          <h4>Submission Preview:</h4>
          <p><strong>First Name:</strong><br /> {submittedData.first_name}</p>
          <p><strong>Last Name:</strong><br /> {submittedData.last_name}</p>
          <p><strong>Email:</strong><br /> {submittedData.email}</p>
          <p><strong>Message:</strong><br /> {submittedData.message}</p>
        </div>
      )}
    </div>
  );
}

export default Contact;
