import nodemailer from 'nodemailer';

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  console.log('Ethereal credentials:');
  console.log('User:', testAccount.user);
  console.log('Pass:', testAccount.pass);
}

createTestAccount();
