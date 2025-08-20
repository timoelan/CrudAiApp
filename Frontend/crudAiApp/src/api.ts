
interface Chat {
  id: number;
  title: string;
}

const API_BASE = 'http://localhost:8001';

export async function loadChats(): Promise<Chat[]> {
  try {
    const response = await fetch(`${API_BASE}/chats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fehler beim Laden der Chats:', error);
    return [];
  }
}

export async function createChat(title: string): Promise<Chat | null> {
  try {
    const response = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title }),
    });
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Erstellen des Chats:', error);
    return null;
  }
}

export async function deleteChat(id: number): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/chats/${id}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Fehler beim Löschen des Chats:', error);
    return false;
  }
}

export async function updateChat(id: number, title: string): Promise<Chat | null> {
  try {
    const response = await fetch(`${API_BASE}/chats/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title }),
    });
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Updaten des Chats:', error);
    return null;
  }
}