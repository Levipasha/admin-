import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicFormUrl } from '../config';

/** Redirect legacy admin-domain form links to the public marketplace site. */
const FormPublicRedirect = () => {
  const { formId } = useParams();

  useEffect(() => {
    if (formId) {
      window.location.replace(getPublicFormUrl(formId));
    }
  }, [formId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      <p className="text-gray-600 text-sm">Opening form…</p>
    </div>
  );
};

export default FormPublicRedirect;
