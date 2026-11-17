import { supabase } from '../supabaseClient'

const T = 'roadmaps'
const fail = (error) => { if (error) throw error }

/* profiles: learning style preference */
export async function loadProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  fail(error)
  return data
}
export async function saveLearningStyle(userId, learning_style) {
  const { error } = await supabase.from('profiles')
    .update({ learning_style, updated_at: new Date().toISOString() }).eq('id', userId)
  fail(error)
}

/* roadmaps: phases (jsonb) + completed milestone ids (jsonb array) */
export async function loadRoadmaps(userId) {
  const { data, error } = await supabase.from(T).select('*').eq('user_id', userId).order('created_at', { ascending: false })
  fail(error)
  return data
}
export async function saveRoadmap(userId, r) {
  const row = {
    id: r.id || crypto.randomUUID(),
    user_id: userId,
    topic: r.topic,
    learning_style: r.learning_style ?? null,
    intensity: r.intensity ?? 1,
    baseline: r.baseline ?? null,
    phases: r.phases ?? [],
    completed_milestones: r.completed_milestones ?? [],
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from(T).upsert(row, { onConflict: 'id' }).select().single()
  fail(error)
  return data
}
export async function saveCompleted(roadmapId, completed_milestones) {
  const { error } = await supabase.from(T)
    .update({ completed_milestones, updated_at: new Date().toISOString() }).eq('id', roadmapId)
  fail(error)
}
export async function deleteRoadmap(id) {
  const { error } = await supabase.from(T).delete().eq('id', id)
  fail(error)
}
/* push roadmaps made in guest mode to the cloud right after sign-in */
export async function migrateGuestRoadmaps(userId, list) {
  await Promise.all(list.map((r) => saveRoadmap(userId, r)))
}
