import BreadCrumb from "../../../components/BreadCrumb/BreadCrumb";
import { dashBoardUrl } from "../../../routes/urls";
import { StudentTable } from "../components/StudentTable";



export function Students() {

    return(
        <main className="admin-main-container">
            <BreadCrumb
                className="department-breadcrumb"
                items={[
                    { label: "Dashboard", to: dashBoardUrl },
                    { label: "Students" },
                ]}
            />

            <StudentTable/>
        </main>
    )
}