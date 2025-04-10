<template>
  <div class="container">
    <header class="header">
      <div class="title-container">
        <el-icon class="title-icon"><Picture /></el-icon>
        <div>
          <h1 class="main-title">梗图博物馆</h1>
          <p class="sub-title">每日欢乐源泉</p>
        </div>
      </div>
    </header>

    <el-skeleton :loading="loading" animated :count="12" :throttle="500">
      <template #template>
        <el-row :gutter="20">
          <el-col 
            v-for="i in 12"
            :key="i"
            :xs="12" :sm="8" :md="6" :lg="4"
          >
            <el-skeleton-item variant="image" class="skeleton-image" />
          </el-col>
        </el-row>
      </template>

      <template #default>
        <el-row :gutter="20">
          <el-col 
            v-for="(img, index) in images"
            :key="index"
            :xs="12" :sm="8" :md="6" :lg="4"
          >
            <div 
              class="image-card-wrapper"
              @mouseenter="hoverIndex = index"
              @mouseleave="hoverIndex = -1"
            >
              <el-card 
                class="image-card"
                :style="{
                  transform: `scale(${hoverIndex === index ? 1.05 : 1})`,
                  boxShadow: hoverIndex === index ? 
                    '0 12px 24px -8px rgba(0,0,0,0.3)' : 
                    '0 6px 12px -4px rgba(0,0,0,0.12)'
                }"
                @click="openLightbox(img.src)"
              >
                <transition name="fade">
                  <img 
                    :src="img.thumbnail"
                    class="thumbnail"
                    :alt="`梗图${index + 1}`"
                    @load="handleImageLoad"
                  />
                </transition>
                <div class="image-meta">
                  <span class="image-index">#{{ index + 1 }}</span>
                  <span class="image-size">{{ img.size }}</span>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>

    <el-dialog 
      v-model="dialogVisible" 
      width="90%"
      top="5vh"
      :show-close="false"
      class="image-dialog"
    >
      <div class="dialog-content">
        <img 
          :src="selectedImage" 
          class="preview-image"
          alt="大图预览"
        />
        <el-button 
          circle
          class="close-button"
          @click="dialogVisible = false"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Close } from '@element-plus/icons-vue'

const images = ref([])
const dialogVisible = ref(false)
const selectedImage = ref('')
const hoverIndex = ref(-1)
const loading = ref(true)
const loadedCount = ref(0)

const getImageSize = async (src) => {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      resolve(`${img.width}x${img.height}`)
    }
    img.src = src
  })
}

const loadImages = async () => {
  const imageModules = import.meta.glob('./assets/images/*', { eager: true })
  const imageList = Object.values(imageModules).map(async module => {
    const size = await getImageSize(module.default)
    return {
      src: module.default,
      thumbnail: module.default,
      size
    }
  })
  return Promise.all(imageList)
}

onMounted(async () => {
  images.value = await loadImages()
})

const handleImageLoad = () => {
  loadedCount.value++
  if (loadedCount.value === images.value.length) {
    loading.value = false
  }
}

const openLightbox = (imgSrc) => {
  selectedImage.value = imgSrc
  dialogVisible.value = true
}
</script>


<style scoped>
.container {
  min-height: 100vh;
  background: #f8f9fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.title-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.title-icon {
  font-size: 3rem;
  color: rgba(255,255,255,0.9);
  padding: 1rem;
  background: rgba(0,0,0,0.1);
  border-radius: 50%;
}

.main-title {
  color: white;
  font-size: 2.5rem;
  margin: 0;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sub-title {
  color: rgba(255,255,255,0.9);
  margin: 0;
  font-size: 1.1rem;
  font-weight: 300;
}

.image-card-wrapper {
  padding: 8px;
  transition: all 0.3s ease;
}

.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
             box-shadow 0.3s ease;
  border: none;
}

.thumbnail {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.image-meta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 1rem;
  color: white;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-card:hover .image-meta {
  opacity: 1;
}

.skeleton-image {
  height: 240px;
  border-radius: 12px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.image-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.dialog-content {
  position: relative;
  padding: 20px;
  background: rgba(0,0,0,0.9);
}

.preview-image {
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255,255,255,0.2);
  transform: rotate(90deg);
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }
  
  .thumbnail {
    height: 180px;
  }
}
</style>