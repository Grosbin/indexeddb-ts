<template>
  <div style="display: flex; flex-direction: column; gap: 10px">
    <input type="text" v-model="text" placeholder="Nombre del usuario" />
    <button @click="handleAddUser">Agregar Usuario</button>

    <input type="text" v-model="userId" placeholder="ID del usuario" />
    <button @click="handleGetUser">Obtener Usuario</button>

    <div v-if="user">
      <p>ID: {{ user.id }}</p>
      <p>Nombre: <input type="text" v-model="user.name" /></p>
      <button @click="handleUpdateUser">Actualizar Usuario</button>
      <button @click="handleDeleteUser">Eliminar Usuario</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import useDB from "./helpers/db.ts";

const text = ref<string>("");
const userId = ref<string>("");
const user = ref<{ id: number; name: string } | null>(null);

const { initDB, addUser, getUser, updateUser, deleteUser } = useDB();

const handleAddUser = async () => {
  try {
    await addUser({ name: text.value }); // No se proporciona 'id', se generará automáticamente
    text.value = "";
  } catch (error) {
    console.error("Failed to add user:", error);
  }
};

const handleGetUser = async () => {
  try {
    const id = Number(userId.value);
    if (!isNaN(id)) {
      const fetchedUser = await getUser(id);
      if (fetchedUser) {
        user.value = fetchedUser;
      } else {
        user.value = null;
        console.error("User not found");
      }
    } else {
      console.error("Invalid ID");
    }
  } catch (error) {
    console.error("Failed to get user:", error);
  }
};

const handleUpdateUser = async () => {
  try {
    if (user.value) {
      await updateUser(user.value);
      console.log("User updated");
    }
  } catch (error) {
    console.error("Failed to update user:", error);
  }
};

const handleDeleteUser = async () => {
  try {
    if (user.value) {
      await deleteUser(user.value.id);
      user.value = null;
      console.log("User deleted");
    }
  } catch (error) {
    console.error("Failed to delete user:", error);
  }
};

onMounted(async () => {
  await initDB();
});
</script>

<style scoped></style>
