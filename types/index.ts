export {};
declare global {
    interface user {
        id: string;
        email: string;
        directus_id: string;
    }

    interface student_relocation {
        id: string;
        name: string;
        status: string;
        date_start: string;
        date_end: string;
    }

    interface student_accommodation_addresses {
        id: string;
        city: string;
        street: string;
        building_number: string;
        house_structure: string;
        corpus: string;
    }

    interface student_accommodations {
        id: string;
        name: string;
        type: string;
        addresses: student_accommodation_addresses[];
        capacity_ids: string[];
        facilities_ids: string[];
    }

    interface student_accommodations_with_addresses {
        id: string;
        name: string;
        addresses: student_accommodation_addresses[];
    }

    interface student_application {
        accommodation_from: {
            id: string | null,
            id_address: string | null,
        },
        accommodation_to: {
            id: string | null,
            id_address: string | null,
        },
        floor: number | null,
        apartment_number: number | null,
        room_number: number | null,
        occupancy: number | null,
        telegram: string | null,
        phone_number: string | null,
        student_relocation_id: number | null,
    }

    interface student_relocation_applications {
        id: string,
        status: string,
        user_created: string,
        date_created: string,
        date_updated: string,
        student_relocation_id: number,
        student_accommodation_id_from: number,
        student_accommodation_id_to: number,
        apartment_number: string,
        room_number: string,
        occupancy: number,
        floor: number,
        gender: string,
        telegram: string,
        phone_number: string,
        student_accommodation_from_address_id: number,
        student_accommodation_to_address_id: number,
        photos_of_room: [
            number
        ]
    }

    interface student_relocation_application_with_data {
        id: string,
        status: string,
        user_created: string,
        date_created: string,
        date_updated: string,
        student_relocation: [],
        student_accommodation_from: [],
        student_accommodation_to: [],
        apartment_number: string,
        room_number: string,
        occupancy: number,
        floor: number,
        gender: string,
        telegram: string,
        phone_number: string,
        student_accommodation_from_address: [],
        student_accommodation_to_address: [],
        photos_of_room: any[any]
    }

    interface student_relocation_application_details {
        id: string,
        status: string,
        user_created: {
            id: string,
            first_name: string,
            last_name: string,
            email: string
        },
        date_created: string,
        date_updated: string,
        student_relocation_id: string,
        student_accommodation_id_from: student_accommodations,
        student_accommodation_id_to: student_accommodations,
        apartment_number: string,
        room_number: string,
        occupancy: number,
        floor: number,
        gender: string,
        telegram: string,
        phone_number: string,
        student_accommodation_from_address_id: student_accommodation_addresses,
        student_accommodation_to_address_id: student_accommodation_addresses,
        photos_of_room: [
            {
                id:string,
                student_relocation_applications_id:string,
                directus_files_id:string,
            }
        ]
    }


}