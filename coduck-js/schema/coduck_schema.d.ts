import { z } from "zod";
declare const taskQuerySchema: z.ZodObject<{
    intent: z.ZodEnum<{
        create: "create";
        none: "none";
        update: "update";
    }>;
    project: z.ZodNullable<z.ZodString>;
    tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        steps: z.ZodArray<z.ZodString>;
        exit_criteria: z.ZodString;
    }, z.core.$strip>>>;
    updates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        task_id: z.ZodString;
        new_status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        new_title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export { taskQuerySchema };
//# sourceMappingURL=coduck_schema.d.ts.map