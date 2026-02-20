import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const { name, email, password, password_confirmation } = await req.json();

    const response = await axios.post(`${process.env.API_BASE_URL}api/register`, {
      name,
      email,
      password,
      password_confirmation,
    });

    // status 201
    if (response.status === 201) {
      return NextResponse.json({ message: response.data.message }, { status: 201 });
    }

    return NextResponse.json({ message: response.data.message }, { status: 201 });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { response } = error;

      // Return validation error if status is 422
      if (response.status === 422) {
        // Extracting the errors safely
        const { data: { errors, message } = {} } = response || {};

        const errorMessage = errors?.email?.[0] || errors?.name?.[0] || errors?.password?.[0] || 'Something went wrong';

        return NextResponse.json(
          {
            error: message || 'Validation error', //title
            message: errorMessage || 'Unknown validation error', //desc
          },
          { status: 422 },
        );
      }
    }
    return NextResponse.json(
      {
        message: 'An unexpected error occurred. Please try again .',
      },
      { status: 500 },
    );
  }
}
