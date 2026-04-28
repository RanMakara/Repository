import CrudPage from '../components/CrudPage';

export default function SuppliersPage() {
  return <CrudPage title='Suppliers' endpoint='suppliers' columns={[{key:'name',label:'Supplier Name'},{key:'contact_person',label:'Contact Person'},{key:'phone',label:'Phone'},{key:'email',label:'Email'}]} fields={[{name:'name',label:'Supplier Name',required:true},{name:'contact_person',label:'Contact Person'},{name:'phone',label:'Phone'},{name:'email',label:'Email',type:'email'},{name:'address',label:'Address'}]} />;
}
