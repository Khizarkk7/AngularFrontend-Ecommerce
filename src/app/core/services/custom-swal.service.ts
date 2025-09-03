import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';


export const CustomSwal = Swal.mixin({
  confirmButtonColor: '#6C63FF',  // tumhara purple color
  cancelButtonColor: '#FF6B6B',   // tumhara red color
  buttonsStyling: true,
});
