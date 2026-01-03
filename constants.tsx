
import React from 'react';
import { CompanyInfo, JobScope } from './types';

export const COMPANY_INFO: CompanyInfo = {
  name: "SMART CITY TECHNOLOGIES PTE LTD",
  address: "24 sin ming lane, 05-97, Singapore 573970",
  phone: "63340543",
  email: "services@smartcitytechnologies.com.sg",
  web: "smartcitytechnologies.com.sg",
  whatsapp: "80458281",
  whatsappGroupLink: "https://chat.whatsapp.com/example-sct-group-link"
};

export const JOB_SCOPES: JobScope[] = [
  JobScope.CARD_ACCESS,
  JobScope.CCTV,
  JobScope.INTERCOM,
  JobScope.BIOMETRICS,
  JobScope.ANPR,
  JobScope.BARRIER,
  JobScope.OTHERS
];

export const APP_NAME = "SCTWMS";
