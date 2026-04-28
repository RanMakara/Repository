import CrudPage from '../components/CrudPage';

export default function CategoriesPage() {
  return <CrudPage title='Categories' endpoint='categories' columns={[{key:'name',label:'Name'},{key:'description',label:'Description'}]} fields={[{name:'name',label:'Category Name',required:true},{name:'description',label:'Description'}]} />;
}
