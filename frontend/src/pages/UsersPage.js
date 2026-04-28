import CrudPage from '../components/CrudPage';

export default function UsersPage() {
  return <CrudPage title='Users' endpoint='users' columns={[{key:'username',label:'Username'},{key:'full_name',label:'Full Name'},{key:'email',label:'Email'},{key:'role',label:'Role'},{key:'status',label:'Status'}]} fields={[{name:'username',label:'Username',required:true},{name:'full_name',label:'Full Name',required:true},{name:'email',label:'Email',type:'email',required:true},{name:'password',label:'Password',type:'password'},{name:'role',label:'Role (Admin/Staff)',required:true},{name:'status',label:'Status (Active/Inactive)',required:true}]} />;
}
